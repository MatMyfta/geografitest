<script>
  import { get, writable } from "svelte/store";
  import { onMount } from "svelte";
  import {
    totalPoints,
    maxPoints,
    remainingRegions,
    selectedArea,
    resetGameVariables,
    askNextRegion,
    updateScore,
    isCorrectRegion,
    calculatePoints,
    clickedRegions,
    correctRegions,
  } from "../utils/gameLogic.js";
  import "@fortawesome/fontawesome-free/css/all.css";
  import GameControl from "../components/GameControl.svelte";

  let regions;
  let showModal = false;
  let L;
  let map;
  let geojsonLayer;
  let currentRegion = null;
  let errors = 0;
  const colors = ["#28a745", "#ffc107", "#fd7e14", "#dc3545"];
  let incorrectRegions = new Set();

  onMount(async () => {
    await initializeMap();
    await loadRegionsAndSetupMap();
  });

  async function initializeMap() {
    // Import Leaflet dynamically and assign to L
    L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");

    // Initialize the Leaflet map
    map = L.map("map", {
      minZoom: 5,
      zoomControl: false,
      attributionControl: false,
    }).setView([42.5, 12.5], 6);
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);
  }

  async function loadRegionsAndSetupMap() {
    await loadRegions();
    remainingRegions.set(regions.features.slice());
    maxPoints.set(regions.features.length * 3);
    loadGeoJsonLayer();
    currentRegion = askNextRegion();
  }

  async function loadRegions() {
    const response = await fetch(
      $selectedArea === "regions"
        ? "/assets/private/italy_regions.geojson"
        : "/assets/private/italy_provinces.geojson"
    );
    regions = await response.json();
  }

  function loadGeoJsonLayer() {
    // Remove existing geojson layer if present
    if (geojsonLayer) {
      map.removeLayer(geojsonLayer);
    }

    // Load GeoJSON and add it to the map
    geojsonLayer = L.geoJSON(regions, {
      onEachFeature: (feature, layer) => {
        layer.on({
          click: () => handleRegionClick(feature, layer),
        });
      },
    }).addTo(map);
  }

  function playAgain() {
    resetGameVariables();
    remainingRegions.set(regions.features.slice());
    geojsonLayer.eachLayer((layer) => {
      geojsonLayer.resetStyle(layer);
    });
    incorrectRegions.clear(); // Clear incorrect regions when playing again
    currentRegion = askNextRegion();
    showModal = false;
  }

  async function resetGame() {
    await loadRegionsAndSetupMap();
  }

  // Utility to get feature property name based on the selected area
  function getFeatureProperty(feature, selectedArea) {
    return get(selectedArea) === "regions"
      ? feature.properties.reg_name
      : feature.properties.prov_name;
  }

  // Function to reset the style of incorrect regions
  function resetIncorrectRegions(incorrectRegions) {
    incorrectRegions.forEach((incorrectLayer) => {
      incorrectLayer.setStyle({
        fillColor: "#3388ff",
        fillOpacity: 0.7,
        color: "#3388ff",
      });
      geojsonLayer.resetStyle(incorrectLayer);
    });
    incorrectRegions.clear();
  }

  // Function to set the style of a layer when it is clicked
  function setLayerStyle(
    layer,
    fillColor,
    fillOpacity = 0.7,
    color = "#454545"
  ) {
    layer.setStyle({
      fillColor,
      fillOpacity,
      color,
    });
  }

  // Function to handle correct region click
  function handleCorrectRegionClick(layer, regionName) {
    correctRegions.update((correct) => {
      correct.add(regionName);
      return correct;
    });

    totalPoints.update((n) => n + calculatePoints(errors));
    updateScore(get(totalPoints), get(maxPoints));

    setLayerStyle(layer, colors[Math.min(errors, colors.length - 1)]);
    errors = 0;

    resetIncorrectRegions(incorrectRegions);

    clickedRegions.update((clicked) => {
      clicked.add(regionName);
      return clicked;
    });

    currentRegion = askNextRegion();

    if (!currentRegion) {
      showCompletionModal();
    } else {
      clickedRegions.update((clicked) => {
        clicked.clear();
        return clicked;
      });
    }
  }

  // Function to handle incorrect region click
  function handleIncorrectRegionClick(layer, regionName) {
    errors++;
    incorrectRegions.add(layer);
    setLayerStyle(layer, "#d3d3d3", 0.7);
    clickedRegions.update((clicked) => {
      clicked.add(regionName);
      return clicked;
    });
  }

  // Main function to handle region click
  function handleRegionClick(feature, layer) {
    const regionName = getFeatureProperty(feature, selectedArea);
    clickedRegions.update((clicked) => {
      if (get(correctRegions).has(regionName) || clicked.has(regionName)) {
        // Ignore already clicked regions
        return clicked;
      }

      if (isCorrectRegion(feature, currentRegion, get(selectedArea))) {
        handleCorrectRegionClick(layer, regionName);
      } else {
        handleIncorrectRegionClick(layer, regionName);
      }
      return clicked;
    });
  }

  function showCompletionModal() {
    if (currentRegion && currentRegion.layer) {
      // Set the final region color
      currentRegion.layer.setStyle({
        fillColor: colors[Math.min(errors, colors.length - 1)],
        fillOpacity: 0.7,
        color: "#000",
      });
    }
    showModal = true;
  }
</script>

<GameControl on:resetGame={resetGame} bind:currentRegion />

<div id="map"></div>

{#if showModal}
  <div class="modal-overlay"></div>
  <div class="modal">
    <h2 class="modal-title">Congratulations!</h2>
    <p class="modal-message">You have finished the game!</p>
    <p class="modal-score">
      Your score: {$maxPoints > 0
        ? Math.round(($totalPoints / $maxPoints) * 100)
        : 0}%
    </p>
    <button on:click={() => playAgain()} class="primary-button">
      Play Again
    </button>
  </div>
{/if}
