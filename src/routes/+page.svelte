<script>
  import { onMount } from "svelte";
  let regions;
  let selectedArea = "regions";
  let showModal = false;

  // Leaflet reference
  let L;

  async function loadRegions() {
    const response = await fetch(
      selectedArea === "regions"
        ? "/assets/italy_regions.geojson"
        : "/assets/italy_provinces.geojson"
    );
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
    // Import Leaflet dynamically and assign to `L`
    L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    await loadRegions();
    remainingRegions = [...regions.features];
    // Initialize the Leaflet map
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

    scorePercentage =
      maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    errors = 0;
    askNextRegion();
    maxPoints = remainingRegions.length * 3;
  });

  function playAgain() {
    totalPoints = 0;
    scorePercentage = 0;
    maxPoints = 0;
    showModal = false;
    remainingRegions = [...regions.features];
    geojsonLayer.eachLayer((layer) => {
      geojsonLayer.resetStyle(layer);
    });
    askNextRegion();
  }

  async function resetGame() {
    // Import Leaflet dynamically again in case `resetGame` is called
    if (!L) {
      L = await import("leaflet");
    }
    await loadRegions();
    remainingRegions = [...regions.features];
    map.eachLayer((layer) => {
      if (layer instanceof L.Layer && layer !== map.zoomControl) {
        map.removeLayer(layer);
      }
    });
    geojsonLayer = L.geoJSON(regions, {
      onEachFeature: (feature, layer) => {
        layer.on({
          click: () => handleRegionClick(feature, layer),
        });
      },
    }).addTo(map);
    maxPoints = remainingRegions.length * 3;
    scorePercentage = 0;
    totalPoints = 0;
    currentRegion = null;
    askNextRegion();
    updateCurrentRegionQuestion();
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
    updateCurrentRegionQuestion();
  }

  function handleRegionClick(feature, layer) {
    if (
      (selectedArea === "regions" &&
        feature.properties.reg_name ===
          (currentRegion && currentRegion.properties.reg_name)) ||
      (selectedArea === "provinces" &&
        feature.properties.prov_name ===
          (currentRegion && currentRegion.properties.prov_name))
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

  function updateCurrentRegionQuestion() {
    // Update the question text to reflect the current level
    if (remainingRegions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingRegions.length);
      const feature = remainingRegions[randomIndex];
      currentRegion = { ...feature };
    }
  }
</script>

<div id="map"></div>
<div class="current-region-box">
  <div class="select-container">
    <label for="area-select" class="select-label">Select level: </label>
    <select id="area-select" bind:value={selectedArea} on:change={resetGame}>
      <option value="regions" selected>Regions</option>
      <option value="provinces">Provinces</option>
    </select>
  </div>
  <p>Score: {scorePercentage}%</p>
  {#if selectedArea === "regions"}
    <p>Find the region: <strong>{currentRegion?.properties.reg_name}</strong></p>
  {:else}
    <p>
      Find the province: <strong>{currentRegion.properties.prov_name}</strong>
    </p>
  {/if}
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
    <button on:click={() => playAgain()} class="primary-button"
      >Play Again</button
    >
  </div>
{/if}
