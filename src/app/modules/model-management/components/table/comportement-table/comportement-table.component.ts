import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Observable } from "rxjs";
import { Comportement } from 'src/app/model/types/comportement.object';
import { NicheurCode, NICHEUR_VALUES } from 'src/app/model/types/nicheur.model';
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { EntiteAvecLibelleEtCodeTableComponent } from "../entite-avec-libelle-et-code-table/entite-avec-libelle-et-code-table.component";

@Component({
  selector: "comportement-table",
  styleUrls: [
    "../entite-avec-libelle-et-code-table/entite-avec-libelle-et-code-table.component.scss"
  ],
  templateUrl: "./comportement-table.tpl.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComportementTableComponent extends EntiteAvecLibelleEtCodeTableComponent<
Comportement
> {
  public displayedColumns: string[] = [
    "code",
    "libelle",
    "nicheur",
    "nbDonnees"
  ];

  constructor(private entitiesStoreService: EntitiesStoreService) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
  }

  public getEntities$ = (): Observable<Comportement[]> => {
    return this.entitiesStoreService.getComportements$();
  };

  public getNicheur = (code: NicheurCode): string => {
    return !code ? "" : NICHEUR_VALUES[code].name;
  };
}
