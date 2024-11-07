<script>
  import '@fortawesome/fontawesome-free/css/all.css';
  import { onMount } from "svelte";
  let regions;
  let selectedArea = "regions";
  let showModal = false;
  let expandBox = false;

  // Leaflet reference
  let L;

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
    await initializeMap();
    await loadRegionsAndSetupMap();
  });

  async function initializeMap() {
    // Import Leaflet dynamically and assign to `L`
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
    remainingRegions = [...regions.features];
    maxPoints = remainingRegions.length * 3;

    loadGeoJsonLayer();
    askNextRegion();
  }

  async function loadRegions() {
    const response = await fetch(
      selectedArea === "regions"
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
    remainingRegions = [...regions.features];
    geojsonLayer.eachLayer((layer) => {
      geojsonLayer.resetStyle(layer);
    });
    askNextRegion();
  }

  async function resetGame() {
    await loadRegionsAndSetupMap();
  }

  function resetGameVariables() {
    totalPoints = 0;
    scorePercentage = 0;
    maxPoints = 0;
    showModal = false;
    currentRegion = null;
    errors = 0;
  }

  function askNextRegion() {
    if (remainingRegions.length === 0) {
      showCompletionModal();
      return;
    }
    const randomIndex = Math.floor(Math.random() * remainingRegions.length);
    const feature = remainingRegions[randomIndex];
    const layer = geojsonLayer.getLayers().find((l) => l.feature === feature);
    currentRegion = { ...feature, layer };
    remainingRegions.splice(randomIndex, 1);
  }

  function handleRegionClick(feature, layer) {
    if (isCorrectRegion(feature)) {
      // Correct region
      totalPoints += Math.max(3 - errors, 0);
      updateScore();
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

  function isCorrectRegion(feature) {
    return (
      (selectedArea === "regions" &&
        feature.properties.reg_name ===
          (currentRegion && currentRegion.properties.reg_name)) ||
      (selectedArea === "provinces" &&
        feature.properties.prov_name ===
          (currentRegion && currentRegion.properties.prov_name))
    );
  }

  function updateScore() {
    maxPoints = regions.features.length * 3;
    scorePercentage = Math.round((totalPoints / maxPoints) * 100);
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
<div class="current-region-box">
  <div class="flex">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button on:click={() => (expandBox = !expandBox)}>
      <i class={`fas ${expandBox ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
    </button>
    {#if selectedArea === "regions"}
      <p>
        Find the region: <strong>{currentRegion?.properties.reg_name}</strong>
      </p>
    {:else}
      <p>
        Find the province: <strong>{currentRegion.properties.prov_name}</strong>
      </p>
    {/if}
  </div>
  <div class="more-details">
    {#if expandBox}
      <div class="select-container">
        <label for="area-select" class="select-label">Select level: </label>
        <select
          id="area-select"
          bind:value={selectedArea}
          on:change={resetGame}
        >
          <option value="regions" selected>Regions</option>
          <option value="provinces">Provinces</option>
        </select>
      </div>
      <p>Score: {scorePercentage}%</p>
    {/if}
  </div>
</div>

{#if showModal}
  <div class="modal-overlay"></div>
  <div class="modal">
    <h2 class="modal-title">Congratulations!</h2>
    <p class="modal-message">You have finished the game!</p>
    <p class="modal-score">
      Your score: {maxPoints > 0
        ? Math.round((totalPoints / maxPoints) * 100)
        : 0}%
    </p>
    <button on:click={() => playAgain()} class="primary-button">
      Play Again
    </button>
  </div>
{/if}

<style>
</style>
