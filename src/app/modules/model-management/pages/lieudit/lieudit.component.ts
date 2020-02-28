import { Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import * as _ from "lodash";
import { COORDINATES_SYSTEMS_CONFIG } from "ouca-common/coordinates-system";
import { Coordinates } from "ouca-common/coordinates.object";
import { Lieudit } from "ouca-common/lieudit.object";
import { getOriginCoordinates } from "src/app/modules/shared/helpers/coordinates.helper";
import { FormValidatorHelper } from "../../../shared/helpers/form-validator.helper";
import { EntityDetailsData } from "../../components/entity-details/entity-details-data.object";
import { LieuditFormComponent } from "../../components/form/lieudit-form/lieudit-form.component";
import { EntiteSimpleComponent } from "../entite-simple/entite-simple.component";

@Component({
  templateUrl: "./lieudit.tpl.html"
})
export class LieuditComponent extends EntiteSimpleComponent<Lieudit> {
  public ngOnInit(): void {
    super.ngOnInit();
    this.form = new FormGroup(
      {
        id: new FormControl("", []),
        commune: new FormControl("", []),
        communeId: new FormControl("", [Validators.required]),
        nom: new FormControl("", [Validators.required]),
        altitude: new FormControl("", [
          Validators.required,
          this.altitudeNumberValidator()
        ]),
        coordinates: new FormGroup({
          longitude: new FormControl("", [
            Validators.required,
            this.longitudeNumberValidator()
          ]),
          latitude: new FormControl("", [
            Validators.required,
            this.latitudeNumberValidator()
          ])
        })
      },
      [this.nomValidator]
    );
  }

  public nomValidator: ValidatorFn = (
    formGroup: FormGroup
  ): ValidationErrors | null => {
    const nom = formGroup.controls.nom.value;
    const communeId = formGroup.controls.communeId.value;
    const id = formGroup.controls.id.value;

    const foundEntityByCode: Lieudit =
      nom && communeId
        ? _.find(this.objects, (object: any) => {
            return (
              _.deburr(object.nom.trim().toLowerCase()) ===
                _.deburr(nom.trim().toLowerCase()) &&
              object.commune.id === communeId
            );
          })
        : null;

    const valueIsAnExistingEntity: boolean =
      !!foundEntityByCode && id !== foundEntityByCode.id;

    return valueIsAnExistingEntity
      ? FormValidatorHelper.getValidatorResult(
          "alreadyExistingNom",
          "Il existe déjà " +
            this.getAnEntityLabel() +
            " avec ce nom dans cette commune."
        )
      : null;
  };

  private altitudeNumberValidator(): ValidatorFn {
    return FormValidatorHelper.isAnIntegerValidator(0, 65535);
  }

  private longitudeNumberValidator(): ValidatorFn {
    return FormValidatorHelper.isAnIntegerValidator(0, 16777215);
  }

  private latitudeNumberValidator(): ValidatorFn {
    return FormValidatorHelper.isAnIntegerValidator(0, 16777215);
  }

  getEntityName(): string {
    return "lieudit";
  }

  public getAnEntityLabel(): string {
    return "un lieu-dit";
  }

  public getTheEntityLabel(uppercase?: boolean): string {
    return uppercase ? "Le lieu-dit" : "le lieu-dit";
  }

  public getFormType(): any {
    return LieuditFormComponent;
  }

  public getDetailsData(): EntityDetailsData[] {
    const coordinates: Coordinates = getOriginCoordinates(this.currentObject);

    const detailsData: EntityDetailsData[] = [];
    detailsData[0] = new EntityDetailsData("ID", this.currentObject.id);
    detailsData[1] = new EntityDetailsData(
      "Département",
      this.currentObject.commune.departement.code
    );
    detailsData[2] = new EntityDetailsData(
      "Code de la Commune",
      this.currentObject.commune.code
    );
    detailsData[3] = new EntityDetailsData(
      "Nom de la Commune",
      this.currentObject.commune.nom
    );
    detailsData[4] = new EntityDetailsData(
      "Nom du Lieu-dit",
      this.currentObject.nom
    );
    detailsData[5] = new EntityDetailsData(
      "Altitude",
      this.currentObject.altitude + " mètres"
    );
    detailsData[6] = new EntityDetailsData(
      "Longitude",
      coordinates.longitude +
        " " +
        COORDINATES_SYSTEMS_CONFIG[coordinates.system].unitName
    );
    detailsData[7] = new EntityDetailsData(
      "Latitude",
      coordinates.latitude +
        " " +
        COORDINATES_SYSTEMS_CONFIG[coordinates.system].unitName
    );
    detailsData[8] = new EntityDetailsData(
      "Système de coordonnées",
      COORDINATES_SYSTEMS_CONFIG[coordinates.system].name
    );
    detailsData[9] = new EntityDetailsData(
      "Nombre de fiches espèces",
      this.currentObject.nbDonnees
    );
    return detailsData;
  }
}
