import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Classe } from "ouca-common/classe.object";
import { Espece } from "ouca-common/espece.model";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";
import { UIEspece } from "src/app/models/espece.model";
import { EntitiesStoreService } from "src/app/services/entities-store.service";
import { AutocompleteAttribute } from "../../../shared/components/autocomplete/autocomplete-attribute.object";

@Component({
  selector: "input-espece",
  templateUrl: "./input-espece.tpl.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputEspeceComponent implements OnInit, OnDestroy {
  @Input() public controlGroup: FormGroup;

  @Input() public isMultipleSelectMode?: boolean;

  private readonly destroy$ = new Subject();

  public classes$: Observable<Classe[]>;

  public filteredEspeces$: Observable<UIEspece[]> = new Observable<
    UIEspece[]
  >();

  private selectedClasse$: BehaviorSubject<
    Classe | number[]
  > = new BehaviorSubject<Classe | number[]>(null);

  public classeAutocompleteAttributes: AutocompleteAttribute[] = [
    {
      key: "libelle",
      exactSearchMode: false,
      startWithMode: true
    }
  ];

  public especeAutocompleteAttributes: AutocompleteAttribute[] = [
    {
      key: "code",
      exactSearchMode: true,
      startWithMode: true,
      weight: 10
    },
    {
      key: "nomFrancais",
      exactSearchMode: false,
      startWithMode: false,
      weight: 1
    },
    {
      key: "nomLatin",
      exactSearchMode: false,
      startWithMode: false,
      weight: 1
    }
  ];

  constructor(private entitiesStoreService: EntitiesStoreService) {
    this.classes$ = this.entitiesStoreService.getClasses$();
  }

  public ngOnInit(): void {
    const classeControl = this.isMultipleSelectMode
      ? this.controlGroup.get("classes")
      : this.controlGroup.get("classe");

    classeControl.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.resetSelectedEspece();
    });

    if (
      this.controlGroup.controls.espece &&
      this.controlGroup.controls.classe
    ) {
      this.controlGroup.controls.espece.valueChanges.subscribe(
        (selectedEspece) => {
          if (selectedEspece?.id) {
            this.controlGroup.controls.classe.setValue(selectedEspece.classe, {
              emitEvent: false
            });
          }
        }
      );
    }

    classeControl.valueChanges.subscribe((newValue) => {
      // This is done because when we first reach this component, we may have no value changes triggered,
      // so we need to initialize it with null (see the BehaviorSubject above)
      this.selectedClasse$.next(newValue);
    });

    this.filteredEspeces$ = combineLatest(
      this.selectedClasse$,
      this.entitiesStoreService.getEspeces$(),
      (selection, especes) => {
        if (especes) {
          if (selection) {
            if (this.isMultipleSelectMode) {
              if ((selection as number[]).length > 0) {
                return especes.filter((espece) => {
                  return (selection as number[]).includes(espece.classe.id);
                });
              } else {
                return especes;
              }
            } else {
              if ((selection as Classe).id) {
                return especes.filter((espece) => {
                  return (
                    espece.classe &&
                    espece.classe.id === (selection as Classe).id
                  );
                });
              }
            }
          } else {
            return especes;
          }
        } else {
          return [];
        }
      }
    ).pipe(takeUntil(this.destroy$));
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * When selecting a classe, filter the list of especes
   */
  public resetSelectedEspece(): void {
    if (
      this.controlGroup.controls.espece &&
      !!this.controlGroup.controls.espece.value
    ) {
      this.controlGroup.controls.espece.setValue(null);
    } else if (
      this.controlGroup.controls.especes &&
      !!this.controlGroup.controls.especes.value
    ) {
      this.controlGroup.controls.especes.setValue(null);
    }
  }

  public displayClasseFormat = (classe: Classe): string => {
    return classe ? classe.libelle : "";
  };

  public displayEspeceFormat = (espece: Espece): string => {
    return espece
      ? espece.code + " - " + espece.nomFrancais + " - " + espece.nomLatin
      : "";
  };
}
