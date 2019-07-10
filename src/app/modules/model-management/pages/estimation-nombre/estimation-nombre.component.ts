import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { EntityDetailsData } from "../../components/entity-details/entity-details-data.object";
import { EstimationNombreFormComponent } from "../../components/form/estimation-nombre-form/estimation-nombre-form.component";
import { EntiteSimpleComponent } from "../entite-simple/entite-simple.component";

@Component({
  templateUrl: "./estimation-nombre.tpl.html"
})
export class EstimationNombreComponent extends EntiteSimpleComponent<
  EstimationNombre
> {
  public ngOnInit(): void {
    super.ngOnInit();
    this.form = new FormGroup(
      {
        id: new FormControl("", []),
        libelle: new FormControl("", [Validators.required]),
        nonCompte: new FormControl("")
      },
      [this.libelleValidator]
    );
  }

  public getFormType(): any {
    return EstimationNombreFormComponent;
  }

  getEntityName(): string {
    return "estimation-nombre";
  }

  public getAnEntityLabel(): string {
    return "une estimation du nombre";
  }

  public getTheEntityLabel(uppercase?: boolean): string {
    return !!uppercase ? "L'estimation du nombre" : "l'estimation du nombre";
  }

  public getDetailsData(): EntityDetailsData[] {
    const detailsData: EntityDetailsData[] = [];
    detailsData[0] = new EntityDetailsData("ID", this.currentObject.id);
    detailsData[1] = new EntityDetailsData(
      "Libellé",
      this.currentObject.libelle
    );
    detailsData[2] = new EntityDetailsData(
      "Non Compté",
      this.currentObject.nonCompte ? "Oui" : "Non"
    );
    detailsData[3] = new EntityDetailsData(
      "Nombre de fiches espèces",
      this.currentObject.nbDonnees
    );
    return detailsData;
  }
}
