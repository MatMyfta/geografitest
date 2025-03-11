import { GeojsonAdapter } from "./GeojsonAdapter";

export class AlbanianRegionsGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.name;
  }
  getFilename() {
    return "/assets/private/albania-with-regions.geojson";
  }
}
