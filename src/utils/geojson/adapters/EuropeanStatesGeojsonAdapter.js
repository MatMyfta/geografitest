import { GeojsonAdapter } from "./GeojsonAdapter";

export class EuropeanStatesGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.NAME;
  }
  getFilename() {
    return "/assets/private/europe.geojson";
  }
}
