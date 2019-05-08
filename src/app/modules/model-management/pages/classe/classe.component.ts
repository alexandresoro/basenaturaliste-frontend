import { Component } from "@angular/core";
import { Classe } from "basenaturaliste-model/classe.object";
import { EntityDetailsData } from "../../components/entity-details/entity-details-data.object";
import { EntiteAvecLibelleComponent } from "../entite-avec-libelle/entite-avec-libelle.component";

@Component({
  templateUrl: "./classe.tpl.html"
})
export class ClasseComponent extends EntiteAvecLibelleComponent<Classe> {
  public getEntityName(): string {
    return "classe";
  }

  public getAnEntityLabel(): string {
    return "une classe";
  }

  public getNewObject(): Classe {
    return {} as Classe;
  }

  public getDetailsData(): EntityDetailsData[] {
    const detailsData: EntityDetailsData[] = [];
    detailsData[0] = new EntityDetailsData("ID", this.currentObject.id);
    detailsData[1] = new EntityDetailsData(
      "Libellé",
      this.currentObject.libelle
    );
    detailsData[2] = new EntityDetailsData(
      "Nombre d'espèces",
      this.currentObject.nbEspeces
    );
    detailsData[3] = new EntityDetailsData(
      "Nombre de fiches espèces",
      this.currentObject.nbDonnees
    );

    return detailsData;
  }
}
