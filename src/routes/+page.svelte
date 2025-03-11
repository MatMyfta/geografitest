<script>
  // Define the modalities you want to support.
  let modalities = [
    { name: "Regioni Albania", value: "albanian-regions" },
    { name: "Regioni Austria", value: "austrian-regions" },
    { name: "Regioni Italia", value: "italian-regions" },
    { name: "Province Italia", value: "italian-provinces" },
    { name: "Province Germania", value: "german-provinces" },
    { name: "Stati Europei", value: "europe-states" },
    { name: "Impero Romano", value: "roman-empire" },
  ];
</script>

<main class="bg-zinc-100 min-h-screen">
  <div class="flex flex-col justify-center h-screen">
    <div
      class="container mx-auto px-10 py-10 bg-white rounded-xl shadow-xl shadow-slate-950/5"
    >
      <h1 class="font-bold text-2xl md:text-4xl mb-8">Seleziona la modalità</h1>
      <ul
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {#each modalities as modality}
          <li>
            <a
              href="/game?modality={modality.value}"
              class="w-full block text-center font-bold text-zinc-700 border-1 border-slate-900/10 p-4 rounded-xl bg-slate-900/2 hover:border-slate-900/20 hover:bg-slate-900/5 hover:cursor-pointer"
            >
              {modality.name}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>
