import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EstimationDistance } from "ouca-common/estimation-distance.object";
import { Observable } from "rxjs";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EntiteAvecLibelleEditAbstractComponent } from "../entite-avec-libelle/entite-avec-libelle-edit.component";

@Component({
  templateUrl: "../entite-simple/entity-edit.component.html"
})
export class EstimationDistanceEditComponent
  extends EntiteAvecLibelleEditAbstractComponent<EstimationDistance>
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
    return "estimation-distance";
  };

  public getEntities$(): Observable<EstimationDistance[]> {
    return this.entitiesStoreService.getEstimationDistances$();
  }

  public updateEntities = (): void => {
    this.entitiesStoreService.updateEstimationsDistance();
  };

  public getPageTitle = (): string => {
    return "Estimations de la distance";
  };

  public getCreationTitle = (): string => {
    return "Création d'une estimation de la distance";
  };

  public getEditionTitle = (): string => {
    return "Edition d'une estimation de la distance";
  };
}
