import { Component } from "@angular/core";
import { EstimationDistance } from "ouca-common/estimation-distance.object";
import { EntiteAvecLibelleComponent } from "../entite-avec-libelle/entite-avec-libelle.component";

@Component({
  templateUrl: "./estimation-distance.tpl.html"
})
export class EstimationDistanceComponent extends EntiteAvecLibelleComponent<
  EstimationDistance
> {
  getEntityName(): string {
    return "estimation-distance";
  }

  public getAnEntityLabel(): string {
    return "une estimation de la distance";
  }

  public getTheEntityLabel(uppercase?: boolean): string {
    return uppercase
      ? "L'estimation de la distance"
      : "l'estimation de la distance";
  }
}
