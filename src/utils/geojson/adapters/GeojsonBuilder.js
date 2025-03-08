import { EuropeanStatesGeojsonAdapter } from "./EuropeanStatesGeojsonAdapter";
import { ItalianProvincesGeojsonAdapter } from "./ItalianProvincesGeojsonAdapter";
import { ItalianRegionsGeojsonAdapter } from "./ItalianRegionsGeojsonAdapter";

export class GeojsonBuilder {
  static createAdapter(modality) {
    switch (modality) {
      case "italian-regions":
        return new ItalianRegionsGeojsonAdapter();
      case "italian-provinces":
        return new ItalianProvincesGeojsonAdapter();
      case "europe-states":
        return new EuropeanStatesGeojsonAdapter();
    }
    return new ItalianRegionsGeojsonAdapter();
  }
}
