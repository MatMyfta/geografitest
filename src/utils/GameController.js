// src/utils/GameController.js
import { writable } from "svelte/store";

export default class GameController {
  constructor({ modality, mapService, regionService }) {
    this.modality = modality;
    this.mapService = mapService;
    this.regionService = regionService;

    // Plain properties for game state.
    this.errors = 0;
    this.totalPoints = 0;
    this.maxPoints = 0;
    this.remainingRegions = [];
    this.clickedRegions = new Set();
    this.correctRegions = new Set();

    // Svelte stores to expose reactive state.
    this.currentRegionStore = writable(null);
    this.currentRegion = null;

    this.scorePercentageStore = writable(0);

    this.gameStatusStore = writable(false);

    // Other properties.
    this.colors = ["#28a745", "#ffc107", "#fd7e14", "#dc354d"];
    this.incorrectLayers = new Set();
  }

  async initialize() {
    // Initialize map.
    this.map = await this.mapService.initialize();
    this.L = this.mapService.getLeaflet();

    // Load and standardize features via the regionService.
    this.regions = await this.regionService.loadRegions();

    // Initialize state.
    this.remainingRegions = [...this.regions.features];
    this.maxPoints = this.regions.features.length * 3;

    // Set up GeoJSON layer on the map.
    this._setupGeoJsonLayer();

    // Set the first region.
    this._setNextRegion();
  }

  _setupGeoJsonLayer() {
    if (this.geojsonLayer) {
      this.map.removeLayer(this.geojsonLayer);
    }
    let features = [];
    this.geojsonLayer = this.L.geoJSON(this.regions, {
      onEachFeature: (feature, layer) => {
        features.push(layer);
        layer.on({ click: () => this._handleFeatureClick(feature, layer) });
      },
    }).addTo(this.map);
    let group = new L.featureGroup(features);

    this.map.fitBounds(group.getBounds());
  }

  _setNextRegion() {
    // Reset errors for new region.
    this.errors = 0;

    if (this.remainingRegions.length === 0) {
      this.currentRegionStore.set(null);
      this.currentRegion = null;
      return null;
    }

    const randomIndex = Math.floor(
      Math.random() * this.remainingRegions.length
    );
    const feature = this.remainingRegions[randomIndex];
    // Remove the selected feature.
    this.remainingRegions.splice(randomIndex, 1);
    this.currentRegionStore.set(feature);
    this.currentRegion = feature;
    return feature;
  }

  _handleFeatureClick(feature, layer) {
    // Use the standardized canonical_name property.
    const featureName = feature.properties.canonical_name;
    if (
      this.correctRegions.has(featureName) ||
      this.clickedRegions.has(featureName)
    ) {
      return;
    }
    if (this._isCorrectRegion(feature)) {
      this._handleCorrectClick(layer, featureName);
    } else {
      this._handleIncorrectClick(layer, featureName);
    }
  }

  _handleCorrectClick(layer, featureName) {
    this.correctRegions.add(featureName);
    this.totalPoints += this._calculatePoints();
    // Update scorePercentage store.
    this._updateScorePercentage();

    const styleIndex = Math.min(this.errors, this.colors.length - 1);
    this._setLayerStyle(layer, this.colors[styleIndex]);

    this.errors = 0;
    this._resetIncorrectLayers();
    this.clickedRegions.add(featureName);

    if (!this.remainingRegions.length) {
      this.gameStatusStore.set(true);
      this.gameStatus = true;
    } else this._setNextRegion();
  }

  _handleIncorrectClick(layer, featureName) {
    this.errors++;
    this.incorrectLayers.add(layer);
    this._setLayerStyle(layer, "#d3d3d3", 0.7);
    this.clickedRegions.add(featureName);
  }

  _setLayerStyle(layer, fillColor, fillOpacity = 0.7, color = "#454545") {
    layer.setStyle({ fillColor, fillOpacity, color });
  }

  _resetIncorrectLayers() {
    this.incorrectLayers.forEach((layer) => {
      layer.setStyle({
        fillColor: "#3388ff",
        fillOpacity: 0.7,
        color: "#3388ff",
      });
      this.geojsonLayer.resetStyle(layer);
    });
    this.incorrectLayers.clear();
    this.clickedRegions.clear();
  }

  // Simplified using canonical_name.
  _isCorrectRegion(feature) {
    return (
      feature.properties.canonical_name ===
      this.currentRegion.properties.canonical_name
    );
  }

  _calculatePoints() {
    return Math.max(3 - this.errors, 0);
  }

  _updateScorePercentage() {
    const score =
      this.maxPoints > 0
        ? Math.round((this.totalPoints / this.maxPoints) * 100)
        : 0;
    this.scorePercentageStore.set(score);
  }

  reset() {
    // Reset plain properties.
    this.errors = 0;
    this.totalPoints = 0;
    this.remainingRegions = [...this.regions.features];
    this.geojsonLayer.eachLayer((layer) => {
      this.geojsonLayer.resetStyle(layer);
    });
    this.clickedRegions = new Set();
    this.correctRegions = new Set();
    // Update score percentage store.
    this._updateScorePercentage();
    this._setNextRegion();
  }
}
