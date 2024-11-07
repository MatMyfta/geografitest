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

    askNextRegion();
  });

  function playAgain() {
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
      layer.setStyle({
        fillColor: colors[Math.min(errors, colors.length - 1)],
        fillOpacity: 0.7,
        color: "#000",
      });
      askNextRegion();
    } else {
      // Incorrect region
      errors++;
    }
  }
</script>

<div id="map"></div>
<div class="current-region-box">
  {#if currentRegion}
    <p>Find the region: <strong>{currentRegion.properties.reg_name}</strong></p>
  {/if}
</div>

{#if showModal}
  <div class="modal-overlay"></div>
  <div class="modal">
    <p>You have finished the game!</p>
    <button on:click={() => playAgain()}>Play Again</button>
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
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
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
</style>
