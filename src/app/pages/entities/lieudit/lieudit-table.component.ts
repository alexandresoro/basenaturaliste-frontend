import { Component, OnChanges, SimpleChanges } from "@angular/core";
import * as _ from "lodash";
import { MatTableDataSource } from "../../../../../node_modules/@angular/material";
import { Lieudit } from "../../../model/lieudit.object";
import { EntiteSimpleTableComponent } from "../entite-simple/entite-simple-table.component";

interface LieuditRow {
  id: number;
  departement: string;
  codeCommune: string;
  nomCommune: string;
  nom: string;
  altitude: number;
  longitude: number;
  latitude: number;
}

@Component({
  selector: "lieudit-table",
  templateUrl: "./lieudit-table.tpl.html"
})
export class LieuditTableComponent extends EntiteSimpleTableComponent<Lieudit>
  implements OnChanges {
  public displayedColumns: string[] = [
    "departement",
    "codeCommune",
    "nomCommune",
    "nom",
    "altitude",
    "longitude",
    "latitude"
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.objects && !!changes.objects.currentValue) {
      const rows: LieuditRow[] = [];
      _.forEach(changes.objects.currentValue, (value: Lieudit) => {
        rows.push(this.buildRowFromLieudit(value));
      });
      this.dataSource = new MatTableDataSource(rows);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  private buildRowFromLieudit(lieudit: Lieudit): LieuditRow {
    return {
      id: lieudit.id,
      departement: lieudit.commune.departement.code,
      codeCommune: lieudit.commune.code,
      nomCommune: lieudit.commune.nom,
      nom: lieudit.nom,
      altitude: lieudit.altitude,
      longitude: lieudit.longitude,
      latitude: lieudit.latitude
    };
  }
}
