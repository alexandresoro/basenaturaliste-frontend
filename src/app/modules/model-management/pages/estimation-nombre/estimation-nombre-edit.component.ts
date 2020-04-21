import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { Observable } from "rxjs";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EstimationNombreFormComponent } from "../../components/form/estimation-nombre-form/estimation-nombre-form.component";
import { EntiteAvecLibelleEditAbstractComponent } from "../entite-avec-libelle/entite-avec-libelle-edit.component";

@Component({
  templateUrl: "../entite-simple/entity-edit.component.html"
})
export class EstimationNombreEditComponent
  extends EntiteAvecLibelleEditAbstractComponent<EstimationNombre>
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

  public createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl("", []),
      libelle: new FormControl("", [Validators.required]),
      nonCompte: new FormControl("")
    });
  }

  public getEntityName = (): string => {
    return "estimation-nombre";
  };

  public getEntities$(): Observable<EstimationNombre[]> {
    return this.entitiesStoreService.getEstimationNombres$();
  }

  public updateEntities = (): void => {
    this.entitiesStoreService.updateEstimationsNombre();
  };

  public getFormType(): any {
    return EstimationNombreFormComponent;
  }

  public getPageTitle = (): string => {
    return "Estimations du nombre";
  };

  public getCreationTitle = (): string => {
    return "Création d'une estimation du nombre";
  };

  public getEditionTitle = (): string => {
    return "Edition d'une estimation du nombre";
  };
}
