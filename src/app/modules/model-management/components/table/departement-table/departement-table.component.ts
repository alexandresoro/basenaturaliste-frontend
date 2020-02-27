import { Component } from "@angular/core";
import { Departement } from "ouca-common/departement.object";
import { EntiteSimpleTableComponent } from "../entite-simple-table/entite-simple-table.component";

@Component({
  selector: "departement-table",
  styleUrls: ["./departement-table.component.scss"],
  templateUrl: "./departement-table.tpl.html"
})
export class DepartementTableComponent extends EntiteSimpleTableComponent<
  Departement
> {
  public displayedColumns: string[] = [
    "code",
    "nbCommunes",
    "nbLieuxdits",
    "nbDonnees"
  ];
}
