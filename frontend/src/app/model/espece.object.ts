import { Classe } from "./classe.object";
import { EntiteAvecLibelle } from "./entite-avec-libelle.object";

export class Espece extends EntiteAvecLibelle {

    public classe: Classe;

    public code: string;

    public nomFrancais: string;

    public nomLatin: string;

    constructor() {
        super();
    }
}
