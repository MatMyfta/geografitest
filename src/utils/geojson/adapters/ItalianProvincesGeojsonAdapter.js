import { GeojsonAdapter } from "./GeojsonAdapter";

export class ItalianProvincesGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.prov_name;
  }
  getFilename() {
    return "/assets/private/italy_provinces.geojson";
  }
}
