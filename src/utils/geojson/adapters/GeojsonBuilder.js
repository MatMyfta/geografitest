import { EuropeanStatesGeojsonAdapter } from "./EuropeanStatesGeojsonAdapter";
import { ItalianProvincesGeojsonAdapter } from "./ItalianProvincesGeojsonAdapter";
import { ItalianRegionsGeojsonAdapter } from "./ItalianRegionsGeojsonAdapter";
import { AlbanianRegionsGeojsonAdapter } from "./AlbanianRegionsGeojsonAdapter";
import { RomanEmpireGeojsonAdapter } from "./RomanEmpireGeojsonAdapter";
import { AustrianGeojsonAdapter } from "./AustrianGeojsonAdapter";
import { GermanGeojsonAdapter } from "./GermanGeojsonAdapter";

export class GeojsonBuilder {
  static createAdapter(modality) {
    switch (modality) {
      case "albanian-regions":
        return new AlbanianRegionsGeojsonAdapter();
      case "austrian-regions":
        return new AustrianGeojsonAdapter();
      case "italian-regions":
        return new ItalianRegionsGeojsonAdapter();
      case "italian-provinces":
        return new ItalianProvincesGeojsonAdapter();
      case "europe-states":
        return new EuropeanStatesGeojsonAdapter();
      case "german-provinces":
        return new GermanGeojsonAdapter();
      case "roman-empire":
        return new RomanEmpireGeojsonAdapter();
    }
    return new ItalianRegionsGeojsonAdapter();
  }
}
