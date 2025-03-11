import { GeojsonAdapter } from "./GeojsonAdapter";

export class RomanEmpireGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.name;
  }
  getFilename() {
    return "/assets/private/roman-empire.geojson";
  }
}
