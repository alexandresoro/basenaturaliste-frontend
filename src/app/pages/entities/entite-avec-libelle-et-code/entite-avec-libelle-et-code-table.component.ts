import { Component } from "@angular/core";
import { EntiteAvecLibelleEtCode } from "../../../model/entite-avec-libelle-et-code.object";
import { EntiteSimpleTableComponent } from "../entite-simple/entite-simple-table.component";

@Component({
    template: ""
})
export class EntiteAvecLibelleEtCodeTableComponent<T extends EntiteAvecLibelleEtCode>
extends EntiteSimpleTableComponent<T> {

    public displayedColumns: string[] = [
        "libelle",
        "code"
    ];

}
