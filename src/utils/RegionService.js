// @ts-nocheck
import { GeojsonAdapter } from "./geojson/adapters/GeojsonAdapter";

// src/utils/RegionService.js
export default class RegionService {
  /**
   * @param {GeojsonAdapter} adapter - An instance of an adapter (RegionsAdapter, ProvincesAdapter, etc.)
   */
  constructor(adapter) {
    this.adapter = adapter;
  }

  async loadRegions() {
    const path = this.adapter.getFilename();
    const response = await fetch(path);
    const geojson = await response.json();

    geojson.features = geojson.features.map((feature) =>
      this.adapter.adaptFeature(feature)
    );
    return geojson;
  }
}
