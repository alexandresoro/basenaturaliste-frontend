import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import * as _ from "lodash";
import { Coordinates } from "ouca-common/coordinates.object";
import { Lieudit } from "ouca-common/lieudit.object";
import { getOriginCoordinates } from "src/app/modules/shared/helpers/coordinates.helper";
import { EntiteSimpleTableComponent } from "../entite-simple-table/entite-simple-table.component";

interface LieuditRow {
  id: number;
  departement: string;
  codeCommune: number;
  nomCommune: string;
  nom: string;
  altitude: number;
  longitude: number;
  latitude: number;
  nbDonnees: number;
}

@Component({
  selector: "lieudit-table",
  styleUrls: ["./lieudit-table.component.scss"],
  templateUrl: "./lieudit-table.component.html"
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
    "latitude",
    "nbDonnees"
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
    const coordinates: Coordinates = getOriginCoordinates(lieudit);
    return {
      id: lieudit.id,
      departement: lieudit.commune.departement.code,
      codeCommune: lieudit.commune.code,
      nomCommune: lieudit.commune.nom,
      nom: lieudit.nom,
      altitude: lieudit.altitude,
      longitude: coordinates.longitude,
      latitude: coordinates.latitude,
      nbDonnees: lieudit.nbDonnees
    };
  }

  public onRowLieuditClicked(id: number): void {
    if (!!this.selectedObject && this.selectedObject.id === id) {
      this.selectedObject = undefined;
    } else {
      this.selectedObject = this.objects.filter(
        (lieudit) => lieudit.id === id
      )[0];
    }
  }
}
