import { Component } from "@angular/core";
import { Milieu } from "ouca-common/milieu.object";
import { Observable } from "rxjs";
import { EntiteAvecLibelleEtCodeComponent } from "../entite-avec-libelle-et-code/entite-avec-libelle-et-code.component";

@Component({
  templateUrl: "./milieu.component.html"
})
export class MilieuComponent extends EntiteAvecLibelleEtCodeComponent<Milieu> {
  public getEntities$ = (): Observable<Milieu[]> => {
    return this.entitiesStoreService.getMilieux$();
  };

  getEntityName(): string {
    return "milieu";
  }

  public getDeleteMessage(milieu: Milieu): string {
    return (
      "Êtes-vous certain de vouloir supprimer le milieu " +
      milieu.libelle +
      " ? " +
      milieu.nbDonnees +
      " données ont ce milieu."
    );
  }
}
