<script>
  import {
    selectedArea,
    scorePercentage,
    totalPoints,
    maxPoints,
  } from "../utils/gameLogic.js";
  import "@fortawesome/fontawesome-free/css/all.css";
  import { createEventDispatcher, getContext } from "svelte";

  const dispatch = createEventDispatcher();
  export let currentRegion;
  let expandBox = false;
  let incorrectRegions = new Set(); // Track incorrect regions

  // Context for managing the map layers
  const mapContext = getContext('leafletMap');

  function handleSelectChange(event) {
    selectedArea.set(event.target.value);
    dispatch("resetGame");
    scorePercentage.set(0);
    totalPoints.set(0);
    maxPoints.set(0);
    incorrectRegions.clear();
  }

  function toggleExpandBox() {
    expandBox = !expandBox;
  }
</script>

<div class="game-control">
  <div class="flex">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button on:click={toggleExpandBox} class="toggle-button">
      <i class={`fas ${expandBox ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
    </button>

    {#if $selectedArea === "regions"}
      <p>
        Find the region: <strong>{currentRegion?.properties.reg_name}</strong>
      </p>
    {:else}
      <p>
        Find the province: <strong>{currentRegion?.properties.prov_name}</strong>
      </p>
    {/if}
  </div>

  {#if expandBox}
    <div class="more-details">
      <label for="area-select" class="select-label">Select level:</label>
      <select
        id="area-select"
        bind:value={$selectedArea}
        on:change={handleSelectChange}
      >
        <option value="regions">Regions</option>
        <option value="provinces">Provinces</option>
      </select>
      <p>Score: {$scorePercentage}%</p>
    </div>
  {/if}
</div>
