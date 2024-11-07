<script>
  import { onMount } from "svelte";
  let regions;
  let showModal = false;

  async function loadRegions() {
    const response = await fetch("/assets/italy_regions.geojson");
    regions = await response.json();
  }

  let map;
  let geojsonLayer;
  let currentRegion = null;
  let errors = 0;
  let totalPoints = 0;
  let scorePercentage = 0;
  let maxPoints = 0;
  let remainingRegions = [];
  const colors = ["#28a745", "#ffc107", "#fd7e14", "#dc3545"];

  onMount(async () => {
    const L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    await loadRegions();
    remainingRegions = [...regions.features];
    // Initialize the Leaflet map
    // Initialize the map with Leaflet
    map = L.map("map", { minZoom: 5, zoomControl: false }).setView(
      [42.5, 12.5],
      6
    );
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    // Load GeoJSON and add it to the map
    geojsonLayer = L.geoJSON(regions, {
      onEachFeature: (feature, layer) => {
        layer.on({
          click: () => handleRegionClick(feature, layer),
        });
      },
    }).addTo(map);

    scorePercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    errors = 0;
    askNextRegion();
    maxPoints = remainingRegions.length * 3;
  });

  function playAgain() {
    totalPoints = 0;
    scorePercentage = 0;
    totalPoints = 0;
    maxPoints = 0;
    showModal = false;
    remainingRegions = [...regions.features];
    geojsonLayer.eachLayer((layer) => {
      geojsonLayer.resetStyle(layer);
    });
    askNextRegion();
  }

  function askNextRegion() {
    if (remainingRegions.length === 0) {
      if (currentRegion && currentRegion.layer) {
        // Set the final region color
        currentRegion.layer.setStyle({
          fillColor: colors[Math.min(errors, colors.length - 1)],
          fillOpacity: 0.7,
          color: "#000",
        });
      }
      showModal = true;
      return;
    }
    // Pick a random region from the remaining ones
    const randomIndex = Math.floor(Math.random() * remainingRegions.length);
    const feature = remainingRegions[randomIndex];
    const layer = geojsonLayer.getLayers().find((l) => l.feature === feature);
    currentRegion = { ...feature, layer };
    remainingRegions.splice(randomIndex, 1);
    errors = 0;
  }

  function handleRegionClick(feature, layer) {
    if (
      feature.properties.reg_name ===
      (currentRegion && currentRegion.properties.reg_name)
    ) {
      // Correct region
      totalPoints += Math.max(3 - errors, 0);
      maxPoints = regions.features.length * 3;
      scorePercentage = Math.round((totalPoints / maxPoints) * 100);
      layer.setStyle({
        fillColor: colors[Math.min(errors, colors.length - 1)],
        fillOpacity: 0.7,
        color: "#000",
      });
      errors = 0;
      askNextRegion();
    } else {
      // Incorrect region
      errors++;
    }
  }
</script>

<div id="map"></div>
<div class="current-region-box">
  <p>Score: {scorePercentage}%</p>
  {#if currentRegion}
    <p>Find the region: <strong>{currentRegion.properties.reg_name}</strong></p>
  {/if}
</div>

{#if showModal}
  <div class="modal-overlay"></div>
  <div class="modal">
    <h2 class="modal-title">Congratulations!</h2>
    <p class="modal-message">You have finished the game!</p>
    <p class="modal-score">Your score: {maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0}%</p>
    <button on:click={() => playAgain()} class="primary-button">Play Again</button>
  </div>
{/if}

<style>
  #map {
    height: 100vh;
    width: 100%;
    background-color: #f3f5f7;
  }

  .current-region-box {
    position: absolute;
    top: 20px;
    left: 20px;
    background-color: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    font-size: 16px;
  }

  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffff;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    text-align: center;
    max-width: 400px;
    width: 80%;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  }

  .modal-message {
    font-size: 18px;
    margin-bottom: 20px;
    color: #555;
  }

  .modal-score {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #007bff;
  }

  .primary-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }

  .primary-button:hover {
    background-color: #0056b3;
  }

  .primary-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
  }
</style>
