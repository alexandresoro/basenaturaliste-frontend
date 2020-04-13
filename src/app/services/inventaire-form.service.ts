import { Injectable } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { set } from "date-fns";
import * as _ from "lodash";
import { Commune } from "ouca-common/commune.object";
import { getCoordinates } from "ouca-common/coordinates-system";
import { Coordinates } from "ouca-common/coordinates.object";
import { CreationPage } from "ouca-common/creation-page.object";
import { Departement } from "ouca-common/departement.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { Lieudit } from "ouca-common/lieudit.object";
import { Meteo } from "ouca-common/meteo.object";
import { Observateur } from "ouca-common/observateur.object";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { InventaireFormObject } from "../modules/donnee-creation/models/inventaire-form-object.model";
import { InventaireFormValue } from "../modules/donnee-creation/models/inventaire-form-value.model";
import { FormValidatorHelper } from "../modules/shared/helpers/form-validator.helper";
import { ListHelper } from "../modules/shared/helpers/list-helper";
import {
  interpretBrowserDateAsTimestampDate,
  interpretDateTimestampAsBrowserDate,
  TimeHelper,
} from "../modules/shared/helpers/time.helper";
import { CoordinatesBuilderService } from "./coordinates-builder.service";
import { CoordinatesService } from "./coordinates.service";
import { CreationPageModelService } from "./creation-page-model.service";
import { DonneeService } from "./donnee.service";

interface DefaultInventaireOptions {
  observateur: Observateur | null;
  observateursAssocies: Observateur[];
  date: Date;
  lieu: {
    departement: Departement | null;
  };
  meteos: Meteo[];
}

@Injectable({
  providedIn: "root",
})
export class InventaireFormService {
  private form: FormGroup;

  constructor(
    private creationPageModelService: CreationPageModelService,
    private coordinatesBuilderService: CoordinatesBuilderService,
    private coordinatesService: CoordinatesService,
    private donneeService: DonneeService
  ) {
    this.createForm();

    // Update the coordinates form controls depending on the application coordinates system
    this.coordinatesService
      .getAppCoordinatesSystem$()
      .subscribe((coordinatesSystemType) => {
        this.coordinatesService.updateCoordinatesValidators(
          coordinatesSystemType,
          (this.form.controls.lieu as FormGroup).controls.longitude,
          (this.form.controls.lieu as FormGroup).controls.latitude
        );
      });

    combineLatest(
      this.creationPageModelService.getCreationPage$(),
      this.donneeService
        .getCurrentDonnee$()
        .pipe(map((donnee) => donnee?.inventaire))
    ).subscribe(([pageModel, inventaire]) => {
      this.updateForm(pageModel, inventaire);
    });
  }

  public getForm = (): FormGroup => {
    return this.form;
  };

  private createForm = (): void => {
    this.form = new FormGroup({
      id: new FormControl(),
      observateur: new FormControl("", [
        Validators.required,
        this.observateurValidator(),
      ]),
      observateursAssocies: new FormControl("", [this.associesValidator()]),
      date: new FormControl("", [Validators.required, this.dateValidator()]),
      heure: new FormControl("", [this.heureValidator()]),
      duree: new FormControl("", [this.dureeValidator()]),
      lieu: new FormGroup({
        departement: new FormControl("", [
          Validators.required,
          this.departementValidator(),
        ]),
        commune: new FormControl("", [
          Validators.required,
          this.communeValidator(),
        ]),
        lieudit: new FormControl("", [
          Validators.required,
          this.lieuditValidator(),
        ]),
        altitude: new FormControl("", [
          Validators.required,
          this.altitudeValidator(),
        ]),
        longitude: new FormControl(),
        latitude: new FormControl(),
      }),
      temperature: new FormControl("", [this.temperatureValidator()]),
      meteos: new FormControl("", [this.meteosValidator()]),
    });

    this.form.disable();
  };

  public setInventaireIdInForm = (id: number): void => {
    this.form.controls.id.setValue(id);
  };

  /**
   * Fill the inventaire form with the values from an existing inventaire
   * @param inventaire Inventaire
   */
  private updateForm = (
    pageModel: CreationPage,
    inventaire: Inventaire | InventaireFormObject
  ): void => {
    if (!pageModel) {
      return;
    }

    console.log("Inventaire à afficher dans le formulaire:", inventaire);

    if (!inventaire) {
      this.form.reset(this.getDefaultOptions(pageModel));
    } else {
      this.form.reset(this.getInventaireFormValue(pageModel, inventaire));
    }
  };

  private getDefaultOptions = (
    pageModel: CreationPage
  ): DefaultInventaireOptions => {
    const defaultObservateur: Observateur = ListHelper.findEntityInListByID(
      pageModel.observateurs,
      pageModel.defaultObservateurId
    );

    const defaultDepartement: Departement = ListHelper.findEntityInListByID(
      pageModel.departements,
      pageModel.defaultDepartementId
    );

    const today = set(new Date(), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    return {
      observateur: defaultObservateur,
      observateursAssocies: [],
      date: today,
      lieu: {
        departement: defaultDepartement,
      },
      meteos: [],
    };
  };

  private getInventaireFormValue = (
    pageModel: CreationPage,
    inventaire: Inventaire
  ): InventaireFormValue => {
    const observateur: Observateur = ListHelper.findEntityInListByID(
      pageModel.observateurs,
      inventaire.observateurId
    );

    const lieudit: Lieudit = ListHelper.findEntityInListByID(
      pageModel.lieudits,
      inventaire.lieuditId
    );

    let commune: Commune = null;
    if (lieudit?.communeId) {
      commune = ListHelper.findEntityInListByID(
        pageModel.communes,
        lieudit.communeId
      );
    } else {
      commune = (inventaire as InventaireFormObject).commune;
    }

    let departement: Departement = null;
    if (!!commune && !!commune.departementId) {
      departement = ListHelper.findEntityInListByID(
        pageModel.departements,
        commune.departementId
      );
    } else {
      departement = (inventaire as InventaireFormObject).departement;
    }

    const associes: Observateur[] = ListHelper.getEntitiesFromIDs(
      pageModel.observateurs,
      inventaire.associesIds
    ) as Observateur[];

    const meteos: Meteo[] = ListHelper.getEntitiesFromIDs(
      pageModel.meteos,
      inventaire.meteosIds
    ) as Meteo[];

    let altitude: number = null;
    let longitude: number = null;
    let latitude: number = null;
    // TO DO observable ?
    const coordinatesSystem = this.coordinatesService.getAppCoordinatesSystem();

    if (lieudit && lieudit.id && _.isNil(inventaire.customizedAltitude)) {
      // Coordinates are not updated for the inventaire
      // We display the lieudit coordinates
      const lieuditCoordinates: Coordinates = getCoordinates(
        lieudit,
        coordinatesSystem
      );
      altitude = lieudit.altitude;
      longitude = lieuditCoordinates.longitude;
      latitude = lieuditCoordinates.latitude;
    } else {
      // Coordinates are updated for the inventaire
      // We display the inventaire coordinates
      const inventaireCoordinates = inventaire.coordinates
        ? getCoordinates(inventaire, coordinatesSystem)
        : {
            longitude: null,
            latitude: null,
            system: coordinatesSystem,
            isTransformed: false,
          };

      altitude = inventaire.customizedAltitude;
      longitude = inventaireCoordinates.longitude;
      latitude = inventaireCoordinates.latitude;
    }

    return {
      id: inventaire.id,
      observateur,
      observateursAssocies: associes,
      date: interpretDateTimestampAsBrowserDate(inventaire.date),
      heure: inventaire.heure,
      duree: inventaire.duree,
      lieu: {
        departement,
        commune,
        lieudit,
        altitude,
        longitude,
        latitude,
      },
      temperature: inventaire.temperature,
      meteos,
    };
  };

  public getInventaireFromForm = (): Inventaire => {
    const inventaireFormValue: InventaireFormValue = this.form.value;

    const associesIds: number[] = ListHelper.getIDsFromEntities(
      inventaireFormValue.observateursAssocies
    );

    const date: Date = interpretBrowserDateAsTimestampDate(
      inventaireFormValue.date
    );

    const heure: string = TimeHelper.getFormattedTime(
      inventaireFormValue.heure
    );

    const duree: string = TimeHelper.getFormattedTime(
      inventaireFormValue.duree
    );

    const lieudit: Lieudit = inventaireFormValue.lieu.lieudit;
    let altitude: number = inventaireFormValue.lieu.altitude;
    let longitude: number = inventaireFormValue.lieu.longitude;
    let latitude: number = inventaireFormValue.lieu.latitude;

    let inventaireCoordinates = this.coordinatesBuilderService.buildCoordinates(
      longitude,
      latitude
    );

    if (
      !this.areCoordinatesCustomized(lieudit, altitude, longitude, latitude)
    ) {
      altitude = null;
      longitude = null;
      latitude = null;
      inventaireCoordinates = null;
    }

    const meteosIds: number[] = ListHelper.getIDsFromEntities(
      inventaireFormValue.meteos
    );

    const inventaire: Inventaire = {
      id: inventaireFormValue.id,
      observateurId: inventaireFormValue.observateur?.id
        ? inventaireFormValue.observateur.id
        : null,
      associesIds,
      date: date.toJSON(),
      heure,
      duree,
      lieuditId: lieudit?.id ? lieudit.id : null,
      customizedAltitude: altitude,
      coordinates: inventaireCoordinates,
      temperature: inventaireFormValue.temperature,
      meteosIds,
    };

    console.log("Inventaire généré depuis le formulaire:", inventaire);

    return inventaire;
  };

  public getInventaireFormObject = (): InventaireFormObject => {
    const inventaire = this.getInventaireFromForm();
    const { ...inventaireAttributes } = inventaire;

    const lieuditFormGroup = this.form.controls.lieu as FormGroup;

    return {
      ...inventaireAttributes,
      departement: lieuditFormGroup.controls.departement.value,
      commune: lieuditFormGroup.controls.commune.value,
    };
  };

  public isFormEnabled = (): boolean => {
    return this.form.enabled;
  };

  private areCoordinatesCustomized = (
    lieudit: Lieudit,
    altitude: number,
    longitude: number,
    latitude: number
  ): boolean => {
    if (lieudit?.id) {
      const lieuditCoordinates: Coordinates = getCoordinates(
        lieudit,
        this.coordinatesService.getAppCoordinatesSystem()
      );

      if (
        lieudit.altitude !== altitude ||
        lieuditCoordinates.longitude !== longitude ||
        lieuditCoordinates.latitude !== latitude
      ) {
        return true;
      }
    }

    return false;
  };

  /**
   * The observateur should be filled and should exist
   */
  private observateurValidator = (): ValidatorFn => {
    return FormValidatorHelper.isAnExistingEntityValidator();
  };

  /**
   * The selected associes should exist
   */
  private associesValidator = (): ValidatorFn => {
    return FormValidatorHelper.areExistingEntitiesValidator();
  };

  /**
   * The date should be filled and follow the format DD/MM/YYYY
   */
  private dateValidator = (): ValidatorFn => {
    return FormValidatorHelper.emptyValidator();
  };

  /**
   * The heure should be empty or filled and following the format HH:MM or HHhMM
   */
  private heureValidator = (): ValidatorFn => {
    return FormValidatorHelper.timeValidator();
  };

  /**
   * The durée should be empty or filled and following the format HH:MM or HHhMM
   */
  private dureeValidator = (): ValidatorFn => {
    return FormValidatorHelper.timeValidator();
  };

  /**
   * The departement should be filled and should exist
   */
  private departementValidator = (): ValidatorFn => {
    return FormValidatorHelper.isAnExistingEntityValidator();
  };

  /**
   * The commune should be filled and should exist
   */
  private communeValidator = (): ValidatorFn => {
    return FormValidatorHelper.isAnExistingEntityValidator();
  };

  /**
   * The lieudit should be filled and should exists
   */
  private lieuditValidator = (): ValidatorFn => {
    return FormValidatorHelper.isAnExistingEntityValidator();
  };

  /**
   * The altitude should be filled and should be an integer
   */
  private altitudeValidator = (): ValidatorFn => {
    return this.coordinatesValidator(0, 65535);
  };

  /**
   * The coordinates should be integer
   */
  private coordinatesValidator = (min: number, max: number): ValidatorFn => {
    return FormValidatorHelper.isAnIntegerValidator(min, max);
  };

  /**
   * The temperature should be empty or filled and an integer
   */
  private temperatureValidator = (): ValidatorFn => {
    return FormValidatorHelper.isAnIntegerValidator(-128, 127);
  };

  /**
   * The selected meteos should exist
   */
  private meteosValidator = (): ValidatorFn => {
    return FormValidatorHelper.areExistingEntitiesValidator();
  };
}
