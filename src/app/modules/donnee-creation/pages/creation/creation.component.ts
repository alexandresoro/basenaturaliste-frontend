import { Component, HostListener, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Classe } from "basenaturaliste-model/classe.object";
import { Commune } from "basenaturaliste-model/commune.object";
import { CreationPage } from "basenaturaliste-model/creation-page.object";
import { Departement } from "basenaturaliste-model/departement.object";
import { Donnee } from "basenaturaliste-model/donnee.object";
import { Espece } from "basenaturaliste-model/espece.object";
import { Inventaire } from "basenaturaliste-model/inventaire.object";
import { Lieudit } from "basenaturaliste-model/lieudit.object";
import { Subject } from "rxjs";
import { ConfirmationDialogData } from "../../../shared/components/confirmation-dialog/confirmation-dialog-data.object";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { MultipleOptionsDialogData } from "../../../shared/components/multiple-options-dialog/multiple-options-dialog-data.object";
import { MultipleOptionsDialogComponent } from "../../../shared/components/multiple-options-dialog/multiple-options-dialog.component";
import { BackendApiService } from "../../../shared/services/backend-api.service";
import { SearchByIdDialogComponent } from "../../components/search-by-id-dialog/search-by-id-dialog.component";
import { CreationModeEnum } from "../../helpers/creation-mode.enum";
import { CreationModeHelper } from "../../helpers/creation-mode.helper";
import { DonneeHelper } from "../../helpers/donnee.helper";
import { InventaireHelper } from "../../helpers/inventaire.helper";
import { NavigationService } from "../../services/navigation.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PageComponent } from "../../../shared/pages/page.component";
import { PostResponse } from "basenaturaliste-model/post-response.object";
import { DonneeWithNavigationData } from "basenaturaliste-model/donnee-with-navigation-data.object";

@Component({
  templateUrl: "./creation.tpl.html"
})
export class CreationComponent extends PageComponent implements OnInit {
  public pageModel: CreationPage = {} as CreationPage;

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
    public dialog: MatDialog,
    protected snackbar: MatSnackBar,
    public navigationService: NavigationService
  ) {
    super(snackbar);
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
    this.backendApiService
      .getCreationInitialPageModel()
      .subscribe((creationPage: CreationPage) => {
        this.onInitCreationPageSucces(creationPage);
      });
  }

  /**
   * If back-end call is successful, use the initial creation page model to build the page
   * @param creationPage: CreationPage
   */
  private onInitCreationPageSucces(creationPage: CreationPage): void {
    if (!!creationPage && !!creationPage.observateurs) {
      this.pageModel = creationPage;

      console.log("Modèle de la page de création", this.pageModel);

      this.communes$.next(this.pageModel ? this.pageModel.communes : []);
      this.departements$.next(
        this.pageModel ? this.pageModel.departements : []
      );
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
    } else {
      this.showErrorMessage(
        "Impossible de charger le contenu la page de Saisie des observations."
      );
    }
  }

  /**
   * When clicking on Enter, we save the inventaire or donnee
   * if it is valid
   * and if the focus is not on a textarea field which can contain several lines
   */
  @HostListener("document:keyup", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (
      /*event.ctrlKey &&*/ event.key === "Enter" &&
      document.activeElement.tagName.toLowerCase() !== "textarea"
    ) {
      if (CreationModeHelper.isInventaireMode() && this.inventaireForm.valid) {
        this.onSaveInventaireButtonClicked();
      } else if (CreationModeHelper.isDonneeMode() && this.donneeForm.valid) {
        this.onSaveDonneeButtonClicked();
      } else if (
        CreationModeHelper.isUpdateMode() &&
        this.inventaireForm.valid &&
        this.donneeForm.valid
      ) {
        this.saveInventaireAndDonnee();
      }
    }
  }

  /**
   * Initialize the page to be ready to create an inventaire
   */
  private switchToNewInventaireMode(): void {
    this.navigationService.resetPreviousAndNextDonnee();
    InventaireHelper.initializeInventaireForm(
      this.inventaireForm,
      this.pageModel
    );
    DonneeHelper.initializeDonneeForm(this.donneeForm, this.pageModel);

    this.switchToInventaireMode();
  }

  public isNewInventaireBtnDisplayed(): boolean {
    return CreationModeHelper.isDonneeMode();
  }

  public isUpdateInventaireBtnDisplayed(): boolean {
    return CreationModeHelper.isDonneeMode();
  }

  public isSaveInventaireBtnDisplayed(): boolean {
    return CreationModeHelper.isInventaireMode();
  }

  public isUpdateDonneeBtnDisplayed(): boolean {
    return CreationModeHelper.isUpdateMode();
  }
  public isSaveDonneeBtnDisplayed(): boolean {
    return CreationModeHelper.isDonneeMode();
  }

  public isNewDonneeBtnDisplayed(): boolean {
    return CreationModeHelper.isUpdateMode();
  }

  public isDeleteDonneeBtnDisplayed(): boolean {
    return CreationModeHelper.isUpdateMode();
  }

  public isPreviousDonneeBtnDisplayed(): boolean {
    return this.navigationService.hasPreviousDonnee();
  }

  public isNextDonneeBtnDisplayed(): boolean {
    return this.navigationService.hasNextDonnee();
  }

  /**
   * Called when clicking on Save Inventaire button
   */
  public onSaveInventaireButtonClicked(): void {
    if (InventaireHelper.getDisplayedInventaireId()) {
      // Update the existing inventaire and switch to donnee mode
      this.saveInventaire();
    } else {
      // Wait until first donnee is created to create the inventaire
      // Switch to donnee mode
      this.switchToEditionDonneeMode();
    }
  }

  private saveInventaire(saveDonneeAfterInventaire?: boolean): void {
    const inventaireToBeSaved: Inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );

    this.backendApiService
      .saveInventaire(inventaireToBeSaved)
      .subscribe((response: PostResponse) => {
        if (response.isSuccess) {
          this.onCreateInventaireSuccess(
            response.insertId,
            saveDonneeAfterInventaire
          );
        } else {
          this.showErrorMessage(
            "Une erreur est survenue pendant la sauvegarde de l'inventaire: " +
              response.message
          );
        }
      });
  }

  private onCreateInventaireSuccess(
    savedId: number,
    saveDonnee?: boolean
  ): void {
    this.showSuccessMessage(
      "La fiche inventaire a été sauvegardée avec succès."
    );

    // To know if we were updating an existing inventaire
    const oldInventaireId: number = InventaireHelper.getDisplayedInventaireId();

    if (savedId) {
      // The inventaire ID has been created or updated, we display it
      InventaireHelper.setDisplayedInventaireId(savedId);
    }

    if (saveDonnee) {
      this.createDonnee();
    } else if (oldInventaireId) {
      // We were updating an existing inventaire, we switch to donnee mode
      this.switchToEditionDonneeMode();
    }
  }

  /**
   * Called when clicking on Save Donnee button
   */
  public onSaveDonneeButtonClicked(): void {
    if (InventaireHelper.getDisplayedInventaireId()) {
      // Check if the inventaire still exists in the database
      this.backendApiService
        .getInventaireIdById(InventaireHelper.getDisplayedInventaireId())
        .subscribe((responseId: number) => {
          if (!responseId) {
            // The inventaire is not yet saved, we create both the inventaire and donnee
            InventaireHelper.setDisplayedInventaireId(null);
            this.saveInventaire(true);
          } else {
            // The inventaire is already saved, we only create the donnee
            this.createDonnee();
          }
        });
    } else {
      // The inventaire is not yet saved, we create both the inventaire and donnee
      this.saveInventaire(true);
    }
  }

  private createDonnee(): void {
    const donneeToBeSaved: Donnee = DonneeHelper.getDonneeFromDonneeForm(
      this.donneeForm
    );

    this.backendApiService
      .saveDonnee(donneeToBeSaved)
      .subscribe((response: PostResponse) => {
        if (response.isSuccess) {
          if (!donneeToBeSaved.id) {
            donneeToBeSaved.id = response.insertId;
          }
          this.onSaveDonneeSuccess(donneeToBeSaved);
        } else {
          this.showErrorMessage(response.message);
        }
      });
  }

  private onSaveDonneeSuccess(savedDonnee: Donnee): void {
    this.showSuccessMessage("La fiche espèce a été créée avec succès.");

    savedDonnee.inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );
    this.navigationService.updateNavigationAfterADonneeWasCreated(savedDonnee);
    this.updateNextRegroupement();
    DonneeHelper.initializeDonneeForm(this.donneeForm, this.pageModel);
  }

  /**
   * Called when a donnee is saved to get the next regroupement number
   */
  private updateNextRegroupement(): void {
    this.backendApiService
      .getNextRegroupement()
      .subscribe((regroupement: number) => {
        this.nextRegroupement = regroupement;
      });
  }

  /**
   * Called when clicking on save donnee when in update mode
   */
  public saveInventaireAndDonnee(): void {
    const inventaireToSave: Inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );

    this.backendApiService
      .getInventaireById(InventaireHelper.getDisplayedInventaireId())
      .subscribe((result) => {
        if (InventaireHelper.isInventaireUpdated(result, inventaireToSave)) {
          this.displayInventaireDialog();
        } else {
          this.updateInventaireAndDonnee(false);
        }
      });
  }

  private displayInventaireDialog(): void {
    const ALL_DONNEES_OPTION: number = 1;
    const ONLY_CURRENT_DONNEE_OPTION: number = 2;
    const CANCEL_OPTION: number = 3;

    const updateInventaireDialogData: MultipleOptionsDialogData = {
      title: "Confirmation de mise-à-jour",
      content:
        "Vous avez modifié la fiche inventaire. " +
        "Voulez-vous mettre à jour la fiche inventaire pour cette fiche espèce " +
        "seulement ou pour toutes les fiches espèces de cette fiche inventaire ?",
      options: [
        {
          value: ALL_DONNEES_OPTION,
          label: "Pour toutes les fiches espèces de cette fiche inventaire",
          color: "primary"
        },
        {
          value: ONLY_CURRENT_DONNEE_OPTION,
          label: "Pour cette fiche espèce seulement",
          color: "primary"
        },
        { value: CANCEL_OPTION, label: "Annuler", color: "accent" }
      ]
    };
    const dialogRef = this.dialog.open(MultipleOptionsDialogComponent, {
      width: "800px",
      data: updateInventaireDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === ALL_DONNEES_OPTION) {
        // We just update the existing inventaire
        this.updateInventaireAndDonnee(false);
      } else if (result === ONLY_CURRENT_DONNEE_OPTION) {
        // We create a new inventaire for this donnee
        this.updateInventaireAndDonnee(true);
      }
    });
  }

  /**
   * Calls the backend to update the fiche inventaire and fiche espece
   * If the user wants to update the fiche inventaire only for this fiche
   * espece then we create a new inventaire
   * If the fiche inventaire already exists with another ID we remove the
   * current inventaire to keep only the existing one
   * @param createNewInventaire If we should create a new inventaire for the
   * donnee or just update it for all its donnees
   */
  private updateInventaireAndDonnee(createNewInventaire: boolean): void {
    const inventaireToSave: Inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );
    if (createNewInventaire) {
      inventaireToSave.id = null;
    }

    const donneeToSave: Donnee = DonneeHelper.getDonneeFromDonneeForm(
      this.donneeForm
    );
    donneeToSave.inventaireId = inventaireToSave.id;

    this.backendApiService
      .saveInventaire(inventaireToSave)
      .subscribe((response: PostResponse) => {
        if (response.isSuccess) {
          if (response.insertId) {
            donneeToSave.inventaireId = response.insertId;
            InventaireHelper.setDisplayedInventaireId(response.insertId);
          }

          this.backendApiService
            .saveDonnee(donneeToSave)
            .subscribe((response: PostResponse) => {
              if (response.isSuccess) {
                this.showSuccessMessage(
                  "La fiche espèce et sa fiche inventaire ont été mises à jour avec succès."
                );
                this.updateNextRegroupement();
                // TO DO update next and previous donnee
              } else {
                this.showErrorMessage(
                  "Une erreur est survenue pendant la sauvegarde de la fiche espèce: " +
                    response.message
                );
              }
            });
        } else {
          this.showErrorMessage(
            "Une erreur est survenue pendant la sauvegarde de la fiche inventaire:" +
              response.message
          );
        }
      });
  }

  /**
   * Called when clicking on "Donnee precedente" button
   */
  public onPreviousDonneeBtnClicked(): void {
    const currentDonnee: Donnee = this.getCurrentDonneeFromForm();

    // Save the current donnee, inventaire and mode
    if (!CreationModeHelper.isUpdateMode()) {
      this.saveCurrentContext(currentDonnee);
      this.switchToUpdateMode();
    }

    this.navigationService
      .getPreviousDonnee()
      .then((donnee: DonneeWithNavigationData) => {
        this.displayPreviousDonnne(donnee);

        this.navigationService.updateNavigationAfterPreviousDonneeIsDisplayed(
          donnee.previousDonneeId,
          donnee.nextDonneeId
        );
      });
  }

  private getCurrentDonneeFromForm(): Donnee {
    const currentDonnee: Donnee = DonneeHelper.getDonneeFromDonneeForm(
      this.donneeForm
    );
    currentDonnee.inventaire = InventaireHelper.getInventaireFromInventaireForm(
      this.inventaireForm
    );
    return currentDonnee;
  }

  private saveCurrentContext(currentDonnee: Donnee): void {
    this.navigationService.saveCurrentContext(
      currentDonnee,
      (this.inventaireForm.controls.lieu as FormGroup).controls.departement
        .value,
      (this.inventaireForm.controls.lieu as FormGroup).controls.commune.value,
      (this.donneeForm.controls.especeGroup as FormGroup).controls.classe.value
    );
  }

  private displayPreviousDonnne(previousDonnee: Donnee): void {
    DonneeHelper.setDonneeFormFromDonnee(
      this.donneeForm,
      previousDonnee,
      this.pageModel
    );
    InventaireHelper.setInventaireFormFromInventaire(
      this.inventaireForm,
      previousDonnee.inventaire,
      this.pageModel
    );
  }
  public onNextDonneeBtnClicked(): void {
    this.navigationService
      .getNextDonnee()
      .then((donnee: DonneeWithNavigationData) => {
        this.displayNextDonnee(donnee);

        this.navigationService.updateNavigationAfterNextDonneeIsDisplayed(
          donnee.previousDonneeId,
          donnee.nextDonneeId
        );
      });
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
      if (result) {
        this.onDeleteConfirmButtonClicked();
      }
    });
  }

  public onDeleteConfirmButtonClicked(): void {
    this.deleteDonnee(
      DonneeHelper.getDisplayedDonneeId(),
      InventaireHelper.getDisplayedInventaireId()
    );
  }

  public deleteDonnee(donneeId: number, inventaireId: number): void {
    this.backendApiService
      .deleteDonnee(donneeId, inventaireId)
      .subscribe((response: PostResponse) => {
        if (response.isSuccess) {
          this.onDeleteDonneeSuccess();
        } else {
          this.onDeleteDonneeError(response.message);
        }
      });
  }

  private onDeleteDonneeError(errorMessage: string): void {
    this.showErrorMessage(
      "Une erreur est survenue pendant la suppression de la fiche espèce.",
      errorMessage
    );
  }

  private onDeleteDonneeSuccess(): void {
    this.showSuccessMessage("La fiche espèce a été supprimée avec succès.");
    this.navigationService
      .getNextDonnee()
      .then((donnee: DonneeWithNavigationData) => {
        this.displayNextDonnee(donnee);
        this.navigationService.updateNavigationAfterADonneeWasDeleted(
          donnee.previousDonneeId,
          donnee.nextDonneeId
        );

        // Check if the current inventaire is still existing
        if (InventaireHelper.getDisplayedInventaireId()) {
          this.backendApiService
            .getInventaireIdById(InventaireHelper.getDisplayedInventaireId())
            .subscribe((responseId: number) => {
              if (!responseId) {
                InventaireHelper.setDisplayedInventaireId(null);
              }
            });
        }
      });
  }

  private displayNextDonnee = (nextDonnee: Donnee): void => {
    CreationModeHelper.updateCreationMode(this.navigationService.getNextMode());
    if (CreationModeHelper.isInventaireMode()) {
      this.switchToInventaireMode();
    } else if (CreationModeHelper.isDonneeMode()) {
      this.switchToEditionDonneeMode();
    }

    InventaireHelper.setInventaireFormFromInventaire(
      this.inventaireForm,
      nextDonnee.inventaire,
      this.pageModel,
      this.navigationService.getSavedDepartement(),
      this.navigationService.getSavedCommune()
    );
    DonneeHelper.setDonneeFormFromDonnee(
      this.donneeForm,
      nextDonnee,
      this.pageModel,
      this.navigationService.getSavedClasse()
    );
  };

  /**
   * When clicking on New Inventaire button
   * we switch to inventaire mode and reset the current inventaire ID to null
   * but we do not reset the form fields
   */
  public onNewInventaireBtnClicked(): void {
    InventaireHelper.setDisplayedInventaireId(null);
    this.switchToInventaireMode();
  }

  public onEditInventaireBtnClicked(): void {
    this.switchToInventaireMode();
  }

  public onNewDonneeBtnClicked(): void {
    this.switchToNewInventaireMode();
  }

  public onSearchByIdBtnClicked(): void {
    const dialogRef = this.dialog.open(SearchByIdDialogComponent, {
      width: "450px"
    });

    dialogRef.afterClosed().subscribe((idToFind: number) => {
      if (idToFind) {
        // Save the current donnee, inventaire and mode
        if (!CreationModeHelper.isUpdateMode()) {
          this.saveCurrentContext(this.getCurrentDonneeFromForm());
        }

        this.backendApiService
          .getDonneeByIdWithContext(idToFind)
          .subscribe((donnee: DonneeWithNavigationData) => {
            if (donnee) {
              InventaireHelper.setInventaireFormFromInventaire(
                this.inventaireForm,
                donnee.inventaire,
                this.pageModel
              );
              DonneeHelper.setDonneeFormFromDonnee(
                this.donneeForm,
                donnee,
                this.pageModel
              );
              this.switchToUpdateMode();
              this.navigationService.updateNavigationAfterSearchDonneeById(
                donnee.indexDonnee,
                donnee.previousDonneeId,
                donnee.nextDonneeId
              );
            } else {
              this.showErrorMessage(
                "Aucune fiche espèce trouvée avec l'ID " + idToFind + "."
              );
            }
          });
      }
    });
  }

  private switchToInventaireMode(): void {
    CreationModeHelper.updateCreationMode(CreationModeEnum.NEW_INVENTAIRE);
    InventaireHelper.updateFormState(this.inventaireForm, true);
    DonneeHelper.updateFormState(this.donneeForm, false);
    document.getElementById("input-Observateur").focus();
  }

  private switchToEditionDonneeMode(): void {
    CreationModeHelper.updateCreationMode(CreationModeEnum.NEW_DONNEE);
    InventaireHelper.updateFormState(this.inventaireForm, false);
    DonneeHelper.updateFormState(this.donneeForm, true);
    document.getElementById("input-Espèce").focus();
  }

  private switchToUpdateMode(): void {
    CreationModeHelper.updateCreationMode(CreationModeEnum.UPDATE);
    InventaireHelper.updateFormState(this.inventaireForm, true);
    DonneeHelper.updateFormState(this.donneeForm, true);
    document.getElementById("input-Observateur").focus();
  }

  public getDisplayedInventaireId(): number {
    return InventaireHelper.getDisplayedInventaireId();
  }

  public getDisplayedDonneeId(): number {
    return DonneeHelper.getDisplayedDonneeId();
  }

  public getCurrentDonneeIndex(): number {
    return this.navigationService.getCurrentDonneeIndex();
  }
}
