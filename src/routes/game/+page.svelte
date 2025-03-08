<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import MapService from "../../utils/MapService.js";
  import RegionService from "../../utils/RegionService.js";
  import GameController from "../../utils/GameController.js";
  import { GeojsonBuilder } from "../../utils/geojson/adapters/GeojsonBuilder.js";

  let gameController;
  let currentRegion = null;
  let showModal = false;
  let modality;

  $: modality = $page.url.searchParams.get("modality") || "regions";

  onMount(async () => {
    const mapService = new MapService("map");
    const geojsonAdapter = GeojsonBuilder.createAdapter(modality);
    const regionService = new RegionService(geojsonAdapter);

    gameController = new GameController({
      modality,
      mapService,
      regionService,
    });

    gameController.currentRegionStore.subscribe((val) => {
      currentRegion = val;
    });

    gameController.scorePercentageStore.subscribe((val) => {
      score = val;
    });

    gameController.gameStatusStore.subscribe((val) => {
      gameStatus = val;
      showModal = gameStatus;
    });

    await gameController.initialize();
  });

  function playAgain() {
    if (gameController) {
      gameController.reset();
      showModal = false;
    }
  }

  $: currentRegion = gameController?.currentRegionStore?.val || null;
  $: regionName = currentRegion?.properties.canonical_name || "";

  $: score = gameController?.getScorePercent?.val || 0;
  $: gameStatus = gameController?.gameStatus?.val || false;

</script>

<!-- Game Control UI -->
<div class="game-control">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <p>
        Trova: <strong>{regionName}</strong>
      </p>
    </div>
  </div>

  <div class="more-details mt-4">
    <p class="mb-4">Punteggio: <strong>{score}%</strong></p>
    <a href="/" class="px-4 py-2 bg-red-700 rounded text-white font-bold"
      >Esci</a
    >
  </div>
</div>

<!-- Map container -->
<div id="map"></div>

<!-- Modal -->
{#if showModal}
  <div class="modal-overlay"></div>
  <div class="modal">
    <h2 class="font-bold mb-4 text-xl">Congratulazioni!</h2>
    <p>Hai finito!</p>
    <p>Punteggio: {score}%</p>
    <div class="flex flex-col gap-2 items-center justify-center mt-4">
      <button class="bg-blue-600 text-white font-bold py-2 px-5 rounded cursor-pointer" on:click={playAgain}>Gioca ancora</button>
      <a href="/"  class="bg-gray-400 text-white font-bold py-2 px-5 rounded cursor-pointer" on:click={playAgain}>Esci</a>
    </div>
  </div>
{/if}
