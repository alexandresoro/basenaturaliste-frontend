import { Component } from "@angular/core";
import { Classe } from "ouca-common/classe.object";
import { Observable } from "rxjs";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EntiteAvecLibelleTableComponent } from "../entite-avec-libelle-table/entite-avec-libelle-table.component";

@Component({
  selector: "classe-table",
  styleUrls: [
    "../entite-avec-libelle-table/entite-avec-libelle-table.component.scss",
    "./classe-table.component.scss"
  ],
  templateUrl: "./classe-table.tpl.html"
})
export class ClasseTableComponent extends EntiteAvecLibelleTableComponent<
  Classe
> {
  public displayedColumns: string[] = ["libelle", "nbEspeces", "nbDonnees"];

  constructor(private entitiesStoreService: EntitiesStoreService) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
  }

  public getEntities$ = (): Observable<Classe[]> => {
    return this.entitiesStoreService.getClasses$();
  };
}
