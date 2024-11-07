<script>
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
    currentRegion = askNextRegion();
    showModal = false;
  }

  async function resetGame() {
    await loadRegionsAndSetupMap();
  }

  function handleRegionClick(feature, layer) {
    if (isCorrectRegion(feature, currentRegion, $selectedArea)) {
      // Correct region
      totalPoints.update((n) => n + calculatePoints(errors));
      updateScore($totalPoints, $maxPoints);
      layer.setStyle({
        fillColor: colors[Math.min(errors, colors.length - 1)],
        fillOpacity: 0.7,
        color: "#000",
      });
      errors = 0;
      currentRegion = askNextRegion();
      if (!currentRegion) {
        showCompletionModal();
      }
    } else {
      // Incorrect region
      errors++;
    }
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

<div id="map"></div>

<GameControl on:resetGame={resetGame} bind:currentRegion={currentRegion} />


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
