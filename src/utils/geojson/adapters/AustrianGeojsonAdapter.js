import { GeojsonAdapter } from "./GeojsonAdapter";

export class AustrianGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.name;
  }
  getFilename() {
    return "/assets/private/austria-regions.geojson";
  }
}
