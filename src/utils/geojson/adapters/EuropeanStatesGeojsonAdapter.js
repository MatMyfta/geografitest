import { GeojsonAdapter } from "./GeojsonAdapter";

export class EuropeanStatesGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.name;
  }
  getFilename() {
    return "/assets/private/europe.geojson";
  }
}
