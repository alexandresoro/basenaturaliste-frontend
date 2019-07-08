import { Component } from "@angular/core";
import { Sexe } from "../../../../../../basenaturaliste-model/sexe.object";
import { EntiteAvecLibelleTableComponent } from "../entite-avec-libelle-table/entite-avec-libelle-table.component";

@Component({
  selector: "sexe-table",
  templateUrl: "../entite-avec-libelle-table/entite-avec-libelle-table.tpl.html"
})
export class SexeTableComponent extends EntiteAvecLibelleTableComponent<Sexe> {}
