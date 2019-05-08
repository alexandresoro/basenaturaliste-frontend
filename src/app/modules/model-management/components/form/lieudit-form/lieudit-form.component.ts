import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { Commune } from "basenaturaliste-model/commune.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { BackendApiService } from "../../../../shared/services/backend-api.service";
import { EntitySubFormComponent } from "../entite-simple-form/entity-sub-form.component";

@Component({
  selector: "lieudit-form",
  templateUrl: "./lieudit-form.tpl.html"
})
export class LieuditFormComponent extends EntitySubFormComponent {
  public departements: Departement[];

  private communes: Commune[];

  public filteredCommunes: Commune[];

  public selectedDepartement: Departement;

  public altitudeFormControl = new FormControl("", [Validators.required]);
  public longitudeFormControl = new FormControl("", [Validators.required]);
  public latitudeFormControl = new FormControl("", [Validators.required]);
  public nomLieuDitFormControl = new FormControl("", [Validators.required]);

  constructor(private backendApiService: BackendApiService) {
    super();
  }

  ngOnInit(): void {
    // Get all departements
    this.backendApiService.getAllEntities("departement").subscribe(
      (result: Departement[]) => {
        this.departements = result;
      },
      (error: Response) => {
        console.error("Impossible de trouver les départements (" + error + ")");
      }
    );

    // Get all communes
    this.backendApiService.getAllEntities("commune").subscribe(
      (result: Commune[]) => {
        this.communes = result;
        this.filteredCommunes = [];

        if (!!this.object && !!this.object.commune) {
          this.selectedDepartement = this.object.commune.departement;
          this.updateCommunes();
        }
      },
      (error: Response) => {
        console.error("Impossible de trouver les communes (" + error + ")");
      }
    );
  }

  getNewObject(): Lieudit {
    return {} as Lieudit;
  }

  private updateCommunes(): void {
    if (!!this.selectedDepartement && !!this.selectedDepartement.id) {
      this.filteredCommunes = this.communes.filter(
        (commune) => commune.departement.id === this.selectedDepartement.id
      );
    }
  }
}
