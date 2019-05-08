import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import { Commune } from "basenaturaliste-model/commune.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { BackendApiService } from "../../../../shared/services/backend-api.service";
import { EntitySubFormComponent } from "../entite-simple-form/entity-sub-form.component";

@Component({
  selector: "commune-form",
  templateUrl: "./commune-form.tpl.html"
})
export class CommuneFormComponent extends EntitySubFormComponent {
  public departements: Departement[];

  public codeFormControl = new FormControl("", [Validators.required]);
  public nomFormControl = new FormControl("", [Validators.required]);

  constructor(private backendApiService: BackendApiService) {
    super();
  }

  ngOnInit() {
    // Get all departements
    this.backendApiService.getAllEntities("departement").subscribe(
      (result: Departement[]) => {
        this.departements = result;
      },
      (error: Response) => {
        console.error("Impossible de trouver les départements (" + error + ")");
      }
    );
  }

  getNewObject(): Commune {
    return {} as Commune;
  }
}
