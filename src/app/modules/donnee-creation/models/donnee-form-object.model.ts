import { Classe } from "ouca-common/classe.object";
import { Donnee } from "ouca-common/donnee.object";
import { InventaireFormObject } from "./inventaire-form-object.model";

export interface DonneeFormObject extends Donnee {
  isDonneeEmpty?: boolean;
  classe: Classe;
  inventaire: InventaireFormObject;
}
