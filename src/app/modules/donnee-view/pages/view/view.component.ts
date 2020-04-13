import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import * as _ from "lodash";
import { Age } from "ouca-common/age.object";
import { Classe } from "ouca-common/classe.object";
import { Commune } from "ouca-common/commune.object";
import { Comportement } from "ouca-common/comportement.object";
import { Departement } from "ouca-common/departement.object";
import { DonneesFilter } from "ouca-common/donnees-filter.object";
import { Espece } from "ouca-common/espece.object";
import { EstimationDistance } from "ouca-common/estimation-distance.object";
import { EstimationNombre } from "ouca-common/estimation-nombre.object";
import { FlatDonnee } from "ouca-common/flat-donnee.object";
import { Lieudit } from "ouca-common/lieudit.object";
import { Meteo } from "ouca-common/meteo.object";
import { Milieu } from "ouca-common/milieu.object";
import { Observateur } from "ouca-common/observateur.object";
import { Sexe } from "ouca-common/sexe.object";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { interpretBrowserDateAsTimestampDate } from "src/app/modules/shared/helpers/time.helper";
import { BackendApiService } from "src/app/services/backend-api.service";
import { StatusMessageService } from "../../../../services/status-message.service";
import {
  getContentTypeFromResponse,
  saveFile,
} from "../../../shared/helpers/file-downloader.helper";
import { EspeceWithNbDonnees } from "../../models/espece-with-nb-donnees.model";
@Component({
  styleUrls: ["./view.component.scss"],
  templateUrl: "./view.component.html",
})
export class ViewComponent {
  public searchForm: FormGroup = new FormGroup({
    id: new FormControl(),
    observateurs: new FormControl(),
    temperature: new FormControl(),
    meteos: new FormControl(),
    associes: new FormControl(),
    heure: new FormControl(),
    duree: new FormControl(),
    especeGroup: new FormGroup({
      classes: new FormControl(),
      especes: new FormControl(),
    }),
    lieuditGroup: new FormGroup({
      departements: new FormControl(),
      communes: new FormControl(),
      lieuxdits: new FormControl(),
    }),
    nombreGroup: new FormGroup({
      nombre: new FormControl(),
      estimationsNombre: new FormControl(),
    }),
    sexes: new FormControl(),
    ages: new FormControl(),
    distanceGroup: new FormGroup({
      distance: new FormControl(),
      estimationsDistance: new FormControl(),
    }),
    regroupement: new FormControl(),
    fromDate: new FormControl(),
    toDate: new FormControl(),
    commentaire: new FormControl(),
    comportements: new FormControl(),
    milieux: new FormControl(),
    excelMode: new FormControl(),
  });

  public observateurs: Observateur[];
  public departements$: Subject<Departement[]>;
  public communes$: Subject<Commune[]>;
  public lieuxdits$: Subject<Lieudit[]>;
  public classes$: Subject<Classe[]>;
  public especes$: BehaviorSubject<Espece[]>;
  public estimationsNombre: EstimationNombre[];
  public estimationsDistance: EstimationDistance[];
  public sexes: Sexe[];
  public ages: Age[];
  public comportements: Comportement[];
  public milieux: Milieu[];
  public meteos: Meteo[];

  public displayWaitPanel: boolean = false;

  public displayNoDataPanel: boolean = false;

  public donneesToDisplay: FlatDonnee[] = [];

  public especesWithNbDonnees: EspeceWithNbDonnees[] = [];

  public nombreGroup: FormGroup = this.searchForm.controls[
    "nombreGroup"
  ] as FormGroup;

  public distanceGroup: FormGroup = this.searchForm.controls[
    "distanceGroup"
  ] as FormGroup;

  constructor(
    private backendApiService: BackendApiService,
    private statusMessageService: StatusMessageService
  ) {}

  public ngOnInit(): void {
    this.classes$ = new Subject();
    this.especes$ = new BehaviorSubject([]);
    this.departements$ = new Subject();
    this.communes$ = new Subject();
    this.lieuxdits$ = new Subject();

    combineLatest(
      this.backendApiService.getAllEntities("classe") as Observable<Classe[]>,
      this.backendApiService.getAllEntities("espece") as Observable<Espece[]>,
      this.backendApiService.getAllEntities("departement") as Observable<
        Departement[]
      >,
      this.backendApiService.getAllEntities("commune") as Observable<Commune[]>,
      this.backendApiService.getAllEntities("lieudit") as Observable<Lieudit[]>,
      this.backendApiService.getAllEntities("observateur") as Observable<
        Observateur[]
      >,
      this.backendApiService.getAllEntities("sexe") as Observable<Sexe[]>,
      this.backendApiService.getAllEntities("age") as Observable<Age[]>,
      this.backendApiService.getAllEntities("estimation-nombre") as Observable<
        EstimationNombre[]
      >,
      this.backendApiService.getAllEntities(
        "estimation-distance"
      ) as Observable<EstimationDistance[]>,
      this.backendApiService.getAllEntities("comportement") as Observable<
        Comportement[]
      >,
      this.backendApiService.getAllEntities("milieu") as Observable<Milieu[]>,
      this.backendApiService.getAllEntities("meteo") as Observable<Meteo[]>
    ).subscribe(
      (
        result: [
          Classe[],
          Espece[],
          Departement[],
          Commune[],
          Lieudit[],
          Observateur[],
          Sexe[],
          Age[],
          EstimationNombre[],
          EstimationDistance[],
          Comportement[],
          Milieu[],
          Meteo[]
        ]
      ) => {
        this.classes$.next(result[0] ? result[0] : []);
        this.especes$.next(result[1] ? result[1] : []);
        this.departements$.next(result[2] ? result[2] : []);
        this.communes$.next(result[3] ? result[3] : []);
        this.lieuxdits$.next(result[4] ? result[4] : []);
        this.observateurs = result[5] ? result[5] : [];
        this.sexes = result[6] ? result[6] : [];
        this.ages = result[7] ? result[7] : [];
        this.estimationsNombre = result[8] ? result[8] : [];
        this.estimationsDistance = result[9] ? result[9] : [];
        this.comportements = result[10] ? result[10] : [];
        this.milieux = result[11] ? result[11] : [];
        this.meteos = result[12] ? result[12] : [];
      },
      (error: HttpErrorResponse) => {
        console.error(
          "Impossible de trouver les classes ou les espèces (" + error + ")"
        );
      }
    );
  }

  public onSearchButtonClicked(): void {
    this.displayWaitPanel = true;
    this.displayNoDataPanel = false;
    this.donneesToDisplay = [];
    this.especesWithNbDonnees = [];

    const filters: DonneesFilter = this.searchForm.value;
    // Send the dates in UTC
    filters.fromDate = filters.fromDate
      ? interpretBrowserDateAsTimestampDate(
          this.searchForm.controls.fromDate.value
        )
      : null;
    filters.toDate = filters.toDate
      ? interpretBrowserDateAsTimestampDate(
          this.searchForm.controls.toDate.value
        )
      : null;

    if (this.searchForm.controls.excelMode.value) {
      this.backendApiService
        .exportDonneesByCustomizedFilters(filters)
        .subscribe((response) => {
          this.displayWaitPanel = false;

          // This is an ugly "bidouille"
          // The export can exceed tha maximum supported number of data (set in backend)
          // If so, instead of returning the Excel file, it will return an error object
          // So, as this is returned as a blob, we first parse the received blob to check if this is a JSON
          // If this is a JSON, it means that it is not the Excel file, and we display what went wrong (in reason)
          // If this is the excel file, the JSON.parse will fail, so we can safely download it
          // This is really an ugly bidouille :-D
          const reader = new FileReader();
          reader.onload = (): void => {
            let isErrorCase = false;
            try {
              this.statusMessageService.showErrorMessage(
                JSON.parse(reader.result as string).reason
              );
              isErrorCase = true;
            } catch (e) {
              //
            }
            if (!isErrorCase) {
              saveFile(
                response.body,
                "donnees.xlsx",
                getContentTypeFromResponse(response)
              );
            }
          };
          reader.readAsText(response.body);
        });
    } else {
      this.backendApiService
        .getDonneesByCustomizedFilters(filters)
        .subscribe((results: FlatDonnee[]) => {
          this.displayWaitPanel = false;
          this.donneesToDisplay = results;
          this.setEspecesWithNbDonnees(this.donneesToDisplay);
          this.displayNoDataPanel = this.donneesToDisplay.length === 0;
        });
    }
  }

  /**
   * Counts number of donnees by code espece
   */
  private setEspecesWithNbDonnees = (donnees: FlatDonnee[]): void => {
    const nbDonneesByEspeceMap: { [key: string]: number } = _.countBy(
      donnees,
      (donnee) => {
        return donnee.codeEspece;
      }
    );

    this.especesWithNbDonnees = _.map(nbDonneesByEspeceMap, (value, key) => {
      const espece: Espece = _.find(this.especes$.getValue(), (espece) => {
        return espece.code === key;
      });

      return {
        classe: espece.classe.libelle,
        code: key,
        nomFrancais: espece.nomFrancais,
        nomLatin: espece.nomLatin,
        nbDonnees: value,
      };
    });
  };
}
