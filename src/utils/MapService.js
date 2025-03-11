// src/utils/MapService.js
export default class MapService {
  constructor(mapContainerId, options = {}) {
    this.mapContainerId = mapContainerId;
    this.options = options;
    this.L = null;
    this.map = null;
  }

  async initialize() {
    this.L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");

    this.map = this.L.map(this.mapContainerId, {
      minZoom: 4,
      zoomControl: false,
      attributionControl: false,
      ...this.options,
    });

    this.L.control.zoom({ position: "topright" }).addTo(this.map);
    return this.map;
  }

  getLeaflet() {
    return this.L;
  }
}
