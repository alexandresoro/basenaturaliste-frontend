import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Observateur } from "ouca-common/observateur.object";
import { Observable } from "rxjs";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EntiteAvecLibelleEditAbstractComponent } from "../entite-avec-libelle/entite-avec-libelle-edit.component";

@Component({
  templateUrl: "../entite-simple/entity-edit.component.html"
})
export class ObservateurEditComponent
  extends EntiteAvecLibelleEditAbstractComponent<Observateur>
  implements OnInit {
  constructor(
    entitiesStoreService: EntitiesStoreService,
    route: ActivatedRoute,
    router: Router,
    location: Location
  ) {
    super(entitiesStoreService, router, route, location);
  }

  ngOnInit(): void {
    this.initialize();
  }

  public getEntityName = (): string => {
    return "observateur";
  };

  public getEntities$(): Observable<Observateur[]> {
    return this.entitiesStoreService.getObservateurs$();
  }

  public updateEntities = (): void => {
    this.entitiesStoreService.updateObservateurs();
  };

  public getPageTitle = (): string => {
    return "Observateurs";
  };

  public getCreationTitle = (): string => {
    return "Création d'un observateur";
  };

  public getEditionTitle = (): string => {
    return "Edition d'un observateur";
  };
}
