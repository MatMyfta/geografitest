import { GeojsonAdapter } from "./GeojsonAdapter";

export class UnitedStatesGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.name;
  }
  getFilename() {
    return "/assets/private/us-states.geojson";
  }
}
