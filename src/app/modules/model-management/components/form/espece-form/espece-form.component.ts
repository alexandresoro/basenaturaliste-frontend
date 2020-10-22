import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Classe } from "@ou-ca/ouca-model/classe.object";
import { Espece } from "@ou-ca/ouca-model/espece.model";
import { Observable } from "rxjs";
import { CrossFieldErrorMatcher } from "src/app/modules/shared/matchers/cross-field-error.matcher";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EntitySubFormComponent } from "../entite-simple-form/entity-sub-form.component";

@Component({
  selector: "espece-form",
  templateUrl: "./espece-form.tpl.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EspeceFormComponent extends EntitySubFormComponent<Espece> {
  public classes$: Observable<Classe[]>;

  public especeCodeErrorStateMatcher = new CrossFieldErrorMatcher(
    "alreadyExistingCode"
  );

  public especeNomFrancaisErrorStateMatcher = new CrossFieldErrorMatcher(
    "alreadyExistingNomFrancais"
  );

  public especeNomLatinErrorStateMatcher = new CrossFieldErrorMatcher(
    "alreadyExistingNomLatin"
  );

  constructor(private entitiesStoreService: EntitiesStoreService) {
    super();
    this.classes$ = this.entitiesStoreService.getClasses$();
  }
}
