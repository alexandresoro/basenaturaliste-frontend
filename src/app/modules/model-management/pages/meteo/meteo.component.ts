import { Component } from "@angular/core";
import { Meteo } from "ouca-common/meteo.object";
import { Observable } from "rxjs";
import { EntiteAvecLibelleComponent } from "../entite-avec-libelle/entite-avec-libelle.component";

@Component({
  templateUrl: "./meteo.component.html"
})
export class MeteoComponent extends EntiteAvecLibelleComponent<Meteo> {
  public getEntities$ = (): Observable<Meteo[]> => {
    return this.entitiesStoreService.getMeteos$();
  };

  getEntityName(): string {
    return "meteo";
  }

  public getDeleteMessage(meteo: Meteo): string {
    return (
      "Êtes-vous certain de vouloir supprimer la météo " +
      meteo.libelle +
      " ? " +
      meteo.nbDonnees +
      " données ont cette météo."
    );
  }
}
