import { Component } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import { EntiteAvecLibelle } from "basenaturaliste-model/entite-avec-libelle.object";
import * as _ from "lodash";
import { FormValidatorHelper } from "../../../shared/helpers/form-validator.helper";
import { ListHelper } from "../../../shared/helpers/list-helper";
import { EntityDetailsData } from "../../components/entity-details/entity-details-data.object";
import { EntiteAvecLibelleFormComponent } from "../../components/form/entite-avec-libelle-form/entite-avec-libelle-form.component";
import { EntiteSimpleComponent } from "../entite-simple/entite-simple.component";
@Component({
  template: ""
})
export class EntiteAvecLibelleComponent<
  T extends EntiteAvecLibelle
> extends EntiteSimpleComponent<T> {
  public ngOnInit(): void {
    super.ngOnInit();
    this.form = new FormGroup(
      {
        id: new FormControl("", []),
        libelle: new FormControl("", [Validators.required]),
        nbDonnees: new FormControl("", [])
      },
      [this.entityWithLibelleValidator]
    );
  }

  private entityWithLibelleValidator: ValidatorFn = (
    formGroup: FormGroup
  ): ValidationErrors | null => {
    const libelle = formGroup.controls.libelle.value;
    const id = formGroup.controls.id.value;

    const foundEntityByLibelle: EntiteAvecLibelle = ListHelper.findObjectInListByTextValue(
      this.objects,
      "libelle",
      libelle
    );

    const valueIsAnExistingEntity: boolean =
      !!foundEntityByLibelle && id !== foundEntityByLibelle.id;

    return valueIsAnExistingEntity
      ? FormValidatorHelper.getValidatorResult(
          "alreadyExistingLibelle",
          "Il existe déjà " + this.getAnEntityLabel() + " avec ce libellé."
        )
      : null;
  }

  public getFormType(): any {
    return EntiteAvecLibelleFormComponent;
  }

  public getDetailsData(): EntityDetailsData[] {
    const detailsData: EntityDetailsData[] = [];
    detailsData[0] = new EntityDetailsData("ID", this.currentObject.id);
    detailsData[1] = new EntityDetailsData(
      "Libellé",
      this.currentObject.libelle
    );
    detailsData[2] = new EntityDetailsData(
      "Nombre de fiches espèces",
      this.currentObject.nbDonnees
    );

    return detailsData;
  }
}
