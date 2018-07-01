import { Component, OnInit, ViewChild } from "@angular/core";
import * as _ from "lodash";
import {
  MatTable,
  MatTableDataSource
} from "../../../../node_modules/@angular/material";
import { AppConfiguration } from "../../model/app-configuration.object";
import { ConfigurationPage } from "../../model/configuration-page.object";
import { EntiteResult } from "../../model/entite-result.object";
import { GestionMode, GestionModeHelper } from "../entities/gestion-mode.enum";
import { PageComponent } from "../page.component";
import { ConfigurationService } from "./configuration.service";

export interface IdPropriete {
  id: number;
  propriete: string;
}

export interface ProprieteValeur {
  propriete: string;
  valeur: string;
}

const PROPRIETES_A_AFFICHER: IdPropriete[] = [
  { id: 1, propriete: "Nom de l'application" },
  { id: 2, propriete: "Observateur par défaut" },
  { id: 3, propriete: "Département par défaut" },
  { id: 4, propriete: "Estimation du nombre par défaut" },
  { id: 5, propriete: "Nombre par défaut" },
  { id: 6, propriete: "Sexe par défaut" },
  { id: 7, propriete: "Âge par défaut" },
  { id: 8, propriete: "Afficher les observateurs associés" },
  { id: 9, propriete: "Afficher la météo" },
  { id: 10, propriete: "Afficher la distance" },
  { id: 11, propriete: "Afficher le numéro de regroupement" },
  { id: 12, propriete: "Chemin vers MySQL" },
  { id: 13, propriete: "Chemin vers MySQL dump" }
];

@Component({
  selector: "configuration",
  templateUrl: "./configuration.tpl.html"
})
export class ConfigurationComponent extends PageComponent implements OnInit {
  public pageModel: ConfigurationPage;

  public configurationToSave: AppConfiguration;

  public mode: GestionMode;

  public displayedColumns: string[] = ["propriete", "valeur"];
  public dataSource: MatTableDataSource<ProprieteValeur>;

  // @ViewChild(MatTable) table: MatTable;

  constructor(
    private configurationService: ConfigurationService,
    public modeHelper: GestionModeHelper
  ) {
    super();
  }

  public ngOnInit(): void {
    this.switchToViewAllMode();
    this.getCurrentConfigurations();
  }

  public buildDataSource() {
    const dataSourceToBuild: ProprieteValeur[] = [];
    _.forEach(PROPRIETES_A_AFFICHER, (proprieteAAfficher) => {
      let valeurToSet: string;
      if (!this.configurationToSave) {
        valeurToSet = "";
      } else {
        switch (proprieteAAfficher.id) {
          case 1:
            valeurToSet = this.configurationToSave.applicationName;
            break;
          case 2:
            valeurToSet = !!this.configurationToSave.defaultObservateur
              ? this.configurationToSave.defaultObservateur.libelle
              : "";
            break;
          case 3:
            valeurToSet = !!this.configurationToSave.defaultDepartement
              ? this.configurationToSave.defaultDepartement.code
              : "";
            break;
          case 4:
            valeurToSet = !!this.configurationToSave.defaultEstimationNombre
              ? this.configurationToSave.defaultEstimationNombre.libelle
              : "";
            break;
          case 5:
            valeurToSet = "" + this.configurationToSave.defaultNombre;
            break;
          case 6:
            valeurToSet = !!this.configurationToSave.defaultSexe
              ? this.configurationToSave.defaultSexe.libelle
              : "";
            break;
          case 7:
            valeurToSet = !!this.configurationToSave.defaultAge
              ? this.configurationToSave.defaultAge.libelle
              : "";
            break;
          case 8:
            valeurToSet = this.configurationToSave.areAssociesDisplayed
              ? "Oui"
              : "Non";
            break;
          case 9:
            valeurToSet = this.configurationToSave.isMeteoDisplayed
              ? "Oui"
              : "Non";
            break;
          case 10:
            valeurToSet = this.configurationToSave.isDistanceDisplayed
              ? "Oui"
              : "Non";
            break;
          case 11:
            valeurToSet = this.configurationToSave.isRegroupementDisplayed
              ? "Oui"
              : "Non";
            break;
          case 12:
            valeurToSet = this.configurationToSave.mySqlPath;
            break;
          case 13:
            valeurToSet = this.configurationToSave.mySqlDumpPath;
            break;
          default:
            break;
        }
      }
      dataSourceToBuild.push({
        propriete: proprieteAAfficher.propriete,
        valeur: valeurToSet
      });
    });
    this.dataSource = new MatTableDataSource(dataSourceToBuild);
  }

  ////// CALLED FROM UI //////
  public refresh(): void {
    this.ngOnInit();
  }

  public editConfigurations(): void {
    this.switchToEditionMode();
  }

  public saveAppConfiguration(): void {
    console.log("App Configuration à sauvegarder", this.configurationToSave);

    this.configurationService
      .saveAppConfiguration(this.configurationToSave)
      .subscribe(
        (result: EntiteResult<AppConfiguration>) => {
          this.updatePageStatus(result.status, result.messages);
          if (this.isSuccess()) {
            this.onSaveAppConfigurationSuccess(result.object);
          }
        },
        (error: any) => {
          this.onSaveAppConfigurationError(error);
        }
      );
  }

  public cancelEdition(): void {
    this.clearMessages();
    this.switchToViewAllMode();
  }
  ////// END FROM UI //////

  private getCurrentConfigurations(): void {
    this.configurationService.getInitialPageModel().subscribe(
      (configurationPage: ConfigurationPage) => {
        this.onInitConfigurationPageSuccess(configurationPage);
      },
      (error: any) => {
        this.onInitConfigurationPageError(error);
      }
    );
  }

  private onInitConfigurationPageSuccess(
    configurationPage: ConfigurationPage
  ): void {
    this.pageModel = configurationPage;
    this.configurationToSave = configurationPage.appConfiguration;
    this.buildDataSource();
  }

  private onInitConfigurationPageError(error: any): void {
    console.log("Impossible de charger la page de configuration.", error);
    this.setErrorMessage("Impossible de charger la page de configuration.");
  }

  private onSaveAppConfigurationSuccess(
    appConfiguration: AppConfiguration
  ): void {
    this.configurationToSave = appConfiguration;
    this.buildDataSource();
    this.switchToViewAllMode();
  }

  private onSaveAppConfigurationError(error: any): void {
    console.log(
      "Impossible de sauvegarder la configuration de l'application.",
      error
    );
    this.setErrorMessage(
      "Impossible de sauvegarder la configuration de l'application."
    );
  }

  private switchToEditionMode(): void {
    this.clearMessages();
    this.mode = GestionMode.EDITION;
  }

  private switchToViewAllMode(): void {
    this.mode = GestionMode.VIEW_ALL;
  }
}
