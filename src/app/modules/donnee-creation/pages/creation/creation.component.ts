import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { Classe } from "basenaturaliste-model/classe.object";
import { Commune } from "basenaturaliste-model/commune.object";
import { CreationPage } from "basenaturaliste-model/creation-page.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { EntiteResult } from "basenaturaliste-model/entite-result.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { Subject } from "rxjs";
import { ConfirmationDialogData } from "../../../shared/components/confirmation-dialog/confirmation-dialog-data.object";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { PageComponent } from "../../../shared/components/page.component";
import {
  PageStatus,
  PageStatusHelper
} from "../../../shared/helpers/page-status.helper";
import { BackendApiService } from "../../../shared/services/backend-api.service";
import { SearchByIdDialogComponent } from "../../components/search-by-id-dialog/search-by-id-dialog.component";
import { DonneeHelper } from "../../helpers/donnee.helper";
import { InventaireHelper } from "../../helpers/inventaire.helper";
import { CreationModeEnum, CreationModeHelper } from "./creation-mode.enum";
import { NavigationService } from "./navigation.service";

@Component({
  templateUrl: "./creation.tpl.html"
})
export class CreationComponent extends PageComponent implements OnInit {
  public pageModel: CreationPage = {} as CreationPage;

  public pageStatusEnum = PageStatus;

  public mode: CreationModeEnum;

  public nextRegroupement: number;

  public departements$: Subject<Departement[]>;

  public communes$: Subject<Commune[]>;

  public lieuxdits$: Subject<Lieudit[]>;

  public classes$: Subject<Classe[]>;

  public especes$: Subject<Espece[]>;

  public inventaireForm: FormGroup;

  public donneeForm: FormGroup;

  constructor(
    private backendApiService: BackendApiService,
    public modeHelper: CreationModeHelper,
    public dialog: MatDialog,
    public navigationService: NavigationService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.inventaireForm = InventaireHelper.createInventaireForm();
    this.donneeForm = DonneeHelper.createDonneeForm();

    this.departements$ = new Subject();
    this.communes$ = new Subject();
    this.lieuxdits$ = new Subject();
    this.classes$ = new Subject();
    this.especes$ = new Subject();

    this.initCreationPage();
  }

  /**
   * Called when launching the page
   * Call the back-end to get the initial creation page model
   */
  private initCreationPage(): void {
    this.backendApiService.getCreationInitialPageModel().subscribe(
      (creationPage: CreationPage) => {
        this.onInitCreationPageSucces(creationPage);
      },
      (error: any) => {
        this.onInitCreationPageError(error);
      }
    );
  }

  private onInitCreationPageError(error: any): void {
    PageStatusHelper.setErrorStatus(
      "Impossible de charger la page de création.",
      error
    );
  }

  /**
   * If back-end call is successful, use the initial creation page model to build the page
   * @param creationPage: CreationPage
   */
  private onInitCreationPageSucces(creationPage: CreationPage): void {
    this.pageModel = creationPage;

    console.log("Modèle de la page de création", this.pageModel);

    this.communes$.next(this.pageModel ? this.pageModel.communes : []);
    this.departements$.next(this.pageModel ? this.pageModel.departements : []);
    this.lieuxdits$.next(this.pageModel ? this.pageModel.lieudits : []);
    this.classes$.next(this.pageModel ? this.pageModel.classes : []);
    this.especes$.next(this.pageModel ? this.pageModel.especes : []);

    this.nextRegroupement = this.pageModel.nextRegroupement;

    this.navigationService.init(
      this.pageModel.lastDonnee,
      this.pageModel.numberOfDonnees
    );

    // Page model is ready, initalize the page to create a first inventaire
    this.switchToNewInventaireMode();
  }

  /**
   * Initialize the page to be ready to create an inventaire
   */
  private switchToNewInventaireMode(): void {
    InventaireHelper.initializeInventaireForm(
      this.inventaireForm,
      this.pageModel
    );
    DonneeHelper.initializeDonneeForm(this.donneeForm, this.pageModel);

    this.switchToInventaireMode();
  }

  /**
   * Called when clicking on Save Inventaire button
   */
  public saveInventaire(): void {
    const inventaireToBeSaved: Inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );

    this.backendApiService.saveInventaire(inventaireToBeSaved).subscribe(
      (saveInventaireResult: any) => {
        this.onCreateInventaireSuccess(saveInventaireResult);
      },
      (error: any) => {
        this.onCreateInventaireError(error);
      }
    );
  }

  private onCreateInventaireError(error: any): void {
    PageStatusHelper.setErrorStatus(
      "Echec de la création de l'inventaire.",
      error
    );
  }

  private onCreateInventaireSuccess(saveInventaireResult: any): void {
    if (!!saveInventaireResult && !!saveInventaireResult.insertId) {
      PageStatusHelper.setSuccessStatus("L'inventaire a été créé avec succès.");
      InventaireHelper.setDisplayedInventaireId(saveInventaireResult.insertId);
    } else {
      this.onCreateInventaireError(saveInventaireResult);
    }

    this.switchToEditionDonneeMode();
  }

  /**
   * Called when clicking on Save Donnee button
   */
  public saveDonnee(): void {
    const donneeToBeSaved: Donnee = DonneeHelper.getDonneeFromDonneeForm(
      this.donneeForm
    );

    this.backendApiService.saveDonnee(donneeToBeSaved).subscribe(
      (saveResult: any) => {
        this.onSaveDonneeSuccess(saveResult);
      },
      (saveError: any) => {
        this.onSaveDonneeError(saveError);
      }
    );
  }

  private onSaveDonneeError(saveError: any) {
    PageStatusHelper.setErrorStatus(
      "La donnée n'a pas pu être créée ou modifiée.",
      saveError
    );
  }

  private onSaveDonneeSuccess(savedDonnee: Donnee) {
    this.navigationService.updateNavigationAfterADonneeWasSaved(savedDonnee);

    this.updateNextRegroupement();

    DonneeHelper.initializeDonneeForm(this.donneeForm, this.pageModel);
  }

  /**
   * Called when a donnee is saved to get the next regroupement number
   */
  private updateNextRegroupement(): void {
    this.backendApiService.getNextRegroupement().subscribe(
      (regroupement: number) => {
        this.nextRegroupement = regroupement;
      },
      (error: any) => {
        console.error(
          "Impossible de récupérer le prochain regroupement (" + error + ")"
        );
      }
    );
  }

  /**
   * Called when clicking on save donnee when in update mode
   */
  // TODO
  public saveInventaireAndDonnee(): void {
    const isInventaireUpdated: boolean = true; // TODO

    if (!!isInventaireUpdated) {
      this.displayInventaireDialog();
    }
  }

  private displayInventaireDialog(): void {
    const updateInventaireDialogData = new ConfirmationDialogData(
      "Confirmation de mise-à-jour",
      "Voulez-vous mettre à jour la fiche inventaire pour cette fiche espèce " +
        "seulement ou pour toutes les fiches espèces avec cette fiche inventaire ?",
      "Pour toutes les fiches espèces de cette fiche inventaire",
      "Pour cette fiche espèce seulement"
    );
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "700px",
      data: updateInventaireDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        // We just update the inventaire
        this.updateInventaireAndDonnee(false);
      } else {
        // We create a new inventaire for this donnee
        this.updateInventaireAndDonnee(true);
      }
    });
  }

  /**
   * Called when clicking on "Donnee precedente" button
   */
  public onPreviousDonneeBtnClicked(): void {
    const currentInventaire: Inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );
    const currentDonnee: Donnee = DonneeHelper.getDonneeFromDonneeForm(
      this.donneeForm
    );
    currentDonnee.inventaire = currentInventaire;

    // Save the current donnee, inventaire and mode
    if (!this.modeHelper.isUpdateMode(this.mode)) {
      this.navigationService.saveCurrentContext(
        this.mode,
        currentInventaire,
        currentDonnee
      );
      this.switchToUpdateMode();
    }

    let newNextDonnee = currentDonnee;
    if (!!!this.navigationService.currentDonneeIndex) {
      // We are displaying the creation form so the next donnee is the saved donnee
      newNextDonnee = this.navigationService.savedDonnee;
    }

    // Set the current donnee to display
    const newCurrentDonnee: Donnee = this.navigationService.previousDonnee;
    DonneeHelper.setDonneeFormFromDonnee(
      this.donneeForm,
      newCurrentDonnee,
      this.pageModel
    );
    InventaireHelper.setInventaireFormFromInventaire(
      this.inventaireForm,
      newCurrentDonnee.inventaire,
      this.pageModel
    );
    this.navigationService.decreaseIndexOfCurrentDonnee();

    // Disable the navigation buttons
    this.navigationService.setNextDonnee(null);
    this.navigationService.setPreviousDonnee(null);

    this.navigationService.updatePreviousAndNextDonnees(
      newCurrentDonnee,
      null,
      newNextDonnee
    );
  }

  public onNextDonneeBtnClicked(): void {
    const currentDonnee: Donnee = DonneeHelper.getDonneeFromDonneeForm(
      this.donneeForm
    );
    currentDonnee.inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );

    this.mode = this.navigationService.getNextMode();
    if (this.modeHelper.isInventaireMode(this.mode)) {
      this.switchToInventaireMode();
    } else if (this.modeHelper.isDonneeMode(this.mode)) {
      this.switchToEditionDonneeMode();
    }

    const newPreviousDonnee: Donnee = currentDonnee;

    const newCurrentDonnee: Donnee = this.navigationService.nextDonnee;
    InventaireHelper.setInventaireFormFromInventaire(
      this.inventaireForm,
      newCurrentDonnee.inventaire,
      this.pageModel
    );
    DonneeHelper.setDonneeFormFromDonnee(
      this.donneeForm,
      newCurrentDonnee,
      this.pageModel
    );
    this.navigationService.increaseIndexOfCurrentDonnee();

    // Disable the navigation buttons
    this.navigationService.setNextDonnee(null);
    this.navigationService.setPreviousDonnee(null);

    this.navigationService.updatePreviousAndNextDonnees(
      newCurrentDonnee,
      newPreviousDonnee,
      null
    );
  }

  public onNewInventaireBtnClicked(): void {
    this.switchToNewInventaireMode();
  }

  public onEditInventaireBtnClicked(): void {
    this.switchToInventaireMode();
  }

  private setCurrentDonneeToTheNextDonnee(afterDelete: boolean = false): void {
    this.mode = this.navigationService.getNextMode();
    if (this.modeHelper.isInventaireMode(this.mode)) {
      this.switchToInventaireMode();
    } else if (this.modeHelper.isDonneeMode(this.mode)) {
      this.switchToEditionDonneeMode();
    }

    InventaireHelper.setInventaireFormFromInventaire(
      this.inventaireForm,
      this.navigationService.getNextInventaire(),
      this.pageModel
    );
    const newCurrentDonnee: Donnee = this.navigationService.getNextDonnee();
    DonneeHelper.setDonneeFormFromDonnee(
      this.donneeForm,
      newCurrentDonnee,
      this.pageModel
    );
  }

  private setNewNextDonnee(currentDonnee: Donnee) {
    this.navigationService.updateNextDonnee(currentDonnee);
  }

  public deleteDonnee(donneeId: number): void {
    this.backendApiService.deleteDonnee(donneeId).subscribe(
      (deleteResult: any) => {
        this.onDeleteDonneeSuccess(deleteResult);
      },
      (deleteError: any) => {
        this.onDeleteDonneeError(deleteError);
      }
    );
  }

  private onDeleteDonneeSuccess(deleteResult: any): void {
    if (deleteResult.affectedRows > 0) {
      PageStatusHelper.setSuccessStatus(
        "La donnée a été supprimée avec succès."
      );

      this.setCurrentDonneeToTheNextDonnee(true);
      this.navigationService.numberOfDonnees--;
      this.setNewNextDonnee(null);
    } else {
      this.onDeleteDonneeError(deleteResult);
    }
  }

  private onDeleteDonneeError(error: any): void {
    PageStatusHelper.setErrorStatus(
      "Echec de la suppression de la donnée.",
      error
    );
  }

  public isNewDonneeBtnDisplayed(): boolean {
    return false; // TODO
  }

  public isDeleteDonneeBtnDisplayed(): boolean {
    return this.modeHelper.isUpdateMode(this.mode);
  }

  public isPreviousDonneeBtnDisplayed(): boolean {
    return this.navigationService.hasPreviousDonnee();
  }

  public isNextDonneeBtnDisplayed(): boolean {
    return this.navigationService.hasNextDonnee();
  }

  public onBackToCreationDonneeBtnClicked(): void {
    this.redisplayCurrentInventaireAndDonnee();
  }
  public onNewDonneeBtnClicked(): void {
    this.switchToNewInventaireMode();
  }

  public onDeleteDonneeBtnClicked(): void {
    const deleteDialogData = new ConfirmationDialogData(
      "Confirmation de suppression",
      "Êtes-vous certain de vouloir supprimer cette fiche espèce ?",
      "Oui, supprimer",
      "Non, annuler"
    );
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: "450px",
      data: deleteDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        this.onDeleteConfirmButtonClicked();
      }
    });
  }

  public onDeleteConfirmButtonClicked(): void {
    this.deleteDonnee(DonneeHelper.getDisplayedDonneeId());
  }

  private redisplayCurrentInventaireAndDonnee(): void {
    this.mode = this.navigationService.savedMode;
    if (this.modeHelper.isInventaireMode(this.mode)) {
      this.switchToInventaireMode();
      InventaireHelper.setInventaireFormFromInventaire(
        this.inventaireForm,
        this.navigationService.savedInventaire,
        this.pageModel
      );
      DonneeHelper.setDisplayedDonneeId(null);
    } else if (this.modeHelper.isDonneeMode(this.mode)) {
      this.switchToEditionDonneeMode();
      InventaireHelper.setInventaireFormFromInventaire(
        this.inventaireForm,
        this.navigationService.savedInventaire,
        this.pageModel
      );
      DonneeHelper.setDonneeFormFromDonnee(
        this.donneeForm,
        this.navigationService.savedDonnee,
        this.pageModel
      );
    }
  }

  private switchToInventaireMode(): void {
    this.mode = CreationModeEnum.NEW_INVENTAIRE;
    this.handleInventaireFormState(true);
    this.handleDonneeFormState(false);
    document.getElementById("input-Observateur").focus();
  }

  private switchToEditionDonneeMode(): void {
    this.mode = CreationModeEnum.NEW_DONNEE;
    this.handleInventaireFormState(false);
    this.handleDonneeFormState(true);
    document.getElementById("input-Espèce").focus();
  }

  private switchToUpdateMode(): void {
    this.mode = CreationModeEnum.UPDATE;
    this.handleInventaireFormState(true);
    this.handleDonneeFormState(true);
    document.getElementById("input-Observateur").focus();
  }

  private handleInventaireFormState(toEnable: boolean): void {
    if (toEnable) {
      this.inventaireForm.enable();
    } else {
      this.inventaireForm.disable();
    }
  }

  private handleDonneeFormState(toEnable: boolean): void {
    if (toEnable) {
      this.donneeForm.enable();
    } else {
      this.donneeForm.disable();
    }
  }

  public onSearchByIdBtnClicked(): void {
    const dialogRef = this.dialog.open(SearchByIdDialogComponent, {
      width: "450px"
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!!result) {
        // TODO search donnée par ID
        alert("Fonctionnalitée non supportée");
      }
    });
  }

  /**
   * Call the backend to update the fiche inventaire and fiche espece
   * If the user wants to update the fiche inventaire only for this fiche espece then we create a new inventaire
   * @param createNewInventaire If we should create a new inventaire for the donnee or just update it
   */
  private updateInventaireAndDonnee(createNewInventaire: boolean): void {
    const inventaireToSave: Inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );
    if (!!createNewInventaire) {
      inventaireToSave.id = null;
    }

    const donneeToSave: Donnee = DonneeHelper.getDonneeFromDonneeForm(
      this.donneeForm
    );
    donneeToSave.inventaireId = inventaireToSave.id;

    this.backendApiService.saveInventaire(inventaireToSave).subscribe(
      (saveInventaireResult: any) => {
        if (
          !!saveInventaireResult &&
          (saveInventaireResult.affectedRows > 0 ||
            saveInventaireResult.insertId > 0)
        ) {
          if (!!createNewInventaire) {
            donneeToSave.inventaireId = saveInventaireResult.insertId;
          }

          this.backendApiService.saveDonnee(donneeToSave).subscribe(
            (saveDonneeResult: any) => {
              this.onUpdateDonneeAndInventaireSuccess(
                saveInventaireResult,
                saveDonneeResult
              );
            },
            (saveDonneeError: any) => {
              this.onUpdateDonneeError(saveDonneeError);
            }
          );
        } else {
          this.onUpdateInventaireError(saveInventaireResult);
        }
      },
      (saveInventaireError: any) => {
        this.onUpdateInventaireError(saveInventaireError);
      }
    );
  }

  private onUpdateInventaireError(error: any): void {
    PageStatusHelper.setErrorStatus(
      "Impossible de mettre à jour la fiche inventaire et la fiche espèce.",
      error
    );
  }

  private onUpdateDonneeError(error: any): void {
    PageStatusHelper.setErrorStatus(
      "Impossible de mettre à jour la fiche inventaire et la fiche espèce.",
      error
    );
  }

  private onUpdateDonneeAndInventaireSuccess(
    saveInventaireResult: any,
    saveDonneeResult: any
  ) {
    // TODO
  }

  public getDisplayedDonneeId(): number {
    return DonneeHelper.getDisplayedDonneeId();
  }

  public getPageStatus(): PageStatus {
    return PageStatusHelper.getStatus();
  }

  public getMessage(): string {
    return PageStatusHelper.getMessage();
  }
}
