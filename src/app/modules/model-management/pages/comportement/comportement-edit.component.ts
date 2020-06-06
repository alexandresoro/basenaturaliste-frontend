import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Comportement } from "ouca-common/comportement.object";
import { Nicheur, NICHEUR_VALUES } from "ouca-common/nicheur.model";
import { Observable } from "rxjs";
import { CrossFieldErrorMatcher } from "src/app/modules/shared/matchers/cross-field-error.matcher";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EntiteAvecLibelleEtCodeEditAbstractComponent } from "../entite-avec-libelle-et-code/entite-avec-libelle-et-code-edit.component";

@Component({
  templateUrl: "./comportement-edit.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComportementEditComponent
  extends EntiteAvecLibelleEtCodeEditAbstractComponent<Comportement>
  implements OnInit {
  public codeErrorStateMatcher = new CrossFieldErrorMatcher(
    "alreadyExistingCode"
  );

  public libelleErrorStateMatcher = new CrossFieldErrorMatcher(
    "alreadyExistingLibelle"
  );

  public nicheurValues: Nicheur[] = Object.values(NICHEUR_VALUES);

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
    return "comportement";
  };

  public getEntities$(): Observable<Comportement[]> {
    return this.entitiesStoreService.getComportements$();
  }

  public createForm(): FormGroup {
    const form = super.createForm();
    form.addControl("nicheur", new FormControl());
    return form;
  }
  public getPageTitle = (): string => {
    return "Comportements";
  };

  public getCreationTitle = (): string => {
    return "Création d'un comportement";
  };

  public getEditionTitle = (): string => {
    return "Edition d'un comportement";
  };
}
