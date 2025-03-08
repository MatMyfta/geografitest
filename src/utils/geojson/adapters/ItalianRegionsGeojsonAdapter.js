import { GeojsonAdapter } from "./GeojsonAdapter";

export class ItalianRegionsGeojsonAdapter extends GeojsonAdapter {
  getName(feature) {
    return feature.properties.reg_name;
  }
  getFilename() {
    return "/assets/private/italy_regions.geojson";
  }
}
