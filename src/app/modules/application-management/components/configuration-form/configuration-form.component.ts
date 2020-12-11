import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Age } from "@ou-ca/ouca-model/age.object";
import { AppConfiguration } from "@ou-ca/ouca-model/app-configuration.object";
import {
  CoordinatesSystem,
  COORDINATES_SYSTEMS_CONFIG
} from "@ou-ca/ouca-model/coordinates-system";
import { Departement } from "@ou-ca/ouca-model/departement.object";
import { EntiteSimple } from "@ou-ca/ouca-model/entite-simple.object";
import { EstimationNombre } from "@ou-ca/ouca-model/estimation-nombre.object";
import { Observateur } from "@ou-ca/ouca-model/observateur.object";
import { Sexe } from "@ou-ca/ouca-model/sexe.object";
import { Observable, Subject } from "rxjs";
import { AppConfigurationService } from "src/app/services/app-configuration.service";
import { EntitiesStoreService } from "src/app/services/entities-store.service";

@Component({
  selector: "configuration-form",
  styleUrls: ["./configuration-form.component.scss"],
  templateUrl: "./configuration-form.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationFormComponent implements OnInit, OnDestroy {
  @Input() public appConfiguration: AppConfiguration;

  @Output() public confirm: EventEmitter<boolean> = new EventEmitter();

  @Output() public back: EventEmitter<boolean> = new EventEmitter();

  private readonly destroy$ = new Subject();

  public form: FormGroup;

  public observateurs$: Observable<Observateur[]>;

  public departements$: Observable<Departement[]>;

  public estimationsNombre$: Observable<EstimationNombre[]>;

  public sexes$: Observable<Sexe[]>;

  public ages$: Observable<Age[]>;

  constructor(
    private entitiesStoreService: EntitiesStoreService,
    private appConfigurationService: AppConfigurationService,
    private formBuilder: FormBuilder
  ) {
    this.observateurs$ = this.entitiesStoreService.getObservateurs$();
    this.departements$ = this.entitiesStoreService.getDepartements$();
    this.estimationsNombre$ = this.entitiesStoreService.getEstimationNombres$();
    this.sexes$ = this.entitiesStoreService.getSexes$();
    this.ages$ = this.entitiesStoreService.getAges$();

    this.form = this.formBuilder.group({
      id: "",
      defaultObservateur: "",
      defaultDepartement: "",
      defaultEstimationNombre: "",
      defaultNombre: "",
      defaultSexe: "",
      defaultAge: "",
      areAssociesDisplayed: "",
      isMeteoDisplayed: "",
      isDistanceDisplayed: "",
      isRegroupementDisplayed: "",
      coordinatesSystem: ""
    });
  }

  ngOnInit(): void {
    this.form.reset(this.appConfiguration);
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public coordinatesSystems: CoordinatesSystem[] = Object.values(
    COORDINATES_SYSTEMS_CONFIG
  );

  public save(): void {
    this.appConfigurationService
      .saveAppConfiguration(this.form.value)
      .subscribe((isSuccessful) => {
        this.confirm.emit(isSuccessful);
      });
  }

  public cancel(): void {
    this.back.emit();
  }

  public compareEntities(e1: EntiteSimple, e2: EntiteSimple): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }
}
