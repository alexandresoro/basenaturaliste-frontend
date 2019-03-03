import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Classe } from "../../../model/classe.object";
import { Espece } from "../../../model/espece.object";

@Component({
  selector: "input-espece",
  templateUrl: "./input-espece.tpl.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputEspeceComponent implements OnInit {
  @Input() public classes: Classe[];

  @Input() public especes: Espece[];

  @Input() public controlGroup: FormGroup;

  public filteredEspeces: Espece[];

  public ngOnInit(): void {
    this.filteredEspeces = this.especes;
  }

  /**
   * When selecting a classe, filter the list of especes
   */
  public updateEspeces(selectedClasse: Classe): void {
    if (!!selectedClasse && !!selectedClasse.id) {
      this.controlGroup.controls.espece.setValue(null);
      this.filteredEspeces = this.especes.filter(
        (espece) => espece.classeId === selectedClasse.id
      );
    } else {
      // If "Toutes" we display all the especes
      this.filteredEspeces = this.especes;
    }
  }

  private displayClasseFormat = (classe: Classe): string => {
    return !!classe ? classe.libelle : "";
  }

  private displayEspeceFormat = (espece: Espece): string => {
    return !!espece ? espece.code + " - " + espece.nomFrancais : "";
  }
}
