import { GeojsonAdapter } from "./GeojsonAdapter";

export class GermanGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.name;
  }
  getFilename() {
    return "/assets/private/germany.geojson";
  }
}
