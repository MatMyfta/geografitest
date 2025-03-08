export class GeojsonAdapter {
  /**
   * Converts a raw GeoJSON feature into a standardized format.
   * @param {Object} feature - A raw GeoJSON feature.
   * @returns {Object} Standardized feature with { name, geometry, properties }.
   */
  adaptFeature(feature) {
    feature.properties = feature.properties || {};
    feature.properties.canonical_name = this.getName(feature);
    return feature;
  }

  /**
   * Should return the standardized name for the feature.
   * Must be implemented by subclasses.
   */
  getName(feature) {
    throw new Error("getName method must be implemented in subclass");
  }

  /**
   * Returns the filename or URL of the GeoJSON file.
   * Must be implemented by subclasses.
   */
  getFilename() {
    throw new Error("getFilename method must be implemented in subclass");
  }
}
