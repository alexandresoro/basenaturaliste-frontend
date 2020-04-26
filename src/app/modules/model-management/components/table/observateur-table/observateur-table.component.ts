import { Component } from "@angular/core";
import { Observateur } from "ouca-common/observateur.object";
import { Observable } from "rxjs";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EntiteAvecLibelleTableComponent } from "../entite-avec-libelle-table/entite-avec-libelle-table.component";

@Component({
  selector: "observateur-table",
  styleUrls: [
    "../entite-avec-libelle-table/entite-avec-libelle-table.component.scss"
  ],
  templateUrl: "../entite-avec-libelle-table/entite-avec-libelle-table.tpl.html"
})
export class ObservateurTableComponent extends EntiteAvecLibelleTableComponent<
  Observateur
> {
  constructor(private entitiesStoreService: EntitiesStoreService) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
  }

  public getEntities$ = (): Observable<Observateur[]> => {
    return this.entitiesStoreService.getObservateurs$();
  };
}
