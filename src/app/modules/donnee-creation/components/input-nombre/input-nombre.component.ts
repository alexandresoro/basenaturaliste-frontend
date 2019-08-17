import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { EstimationNombre } from "basenaturaliste-model/estimation-nombre.object";
import { distinctUntilChanged } from "rxjs/operators";
import { AutocompleteAttribute } from "../../../shared/components/autocomplete/autocomplete-attribute.object";

@Component({
  selector: "input-nombre",
  templateUrl: "./input-nombre.tpl.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputNombreComponent {
  @Input() public estimationsNombre: EstimationNombre[];

  @Input() public controlGroup: FormGroup;

  @Input() public defaultNombre: number;

  @Input() public isMultipleSelectMode?: boolean;

  public ngOnInit(): void {
    const estimationControl = this.isMultipleSelectMode
      ? this.controlGroup.get("estimationsNombre")
      : this.controlGroup.get("estimationNombre");

    estimationControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((selectedEstimation: EstimationNombre) => {
        this.onEstimationNombreChanged(selectedEstimation);
      });
  }

  public autocompleteAttributes: AutocompleteAttribute[] = [
    {
      key: "libelle",
      exactSearchMode: false,
      startWithMode: true
    }
  ];

  private onEstimationNombreChanged(estimation: EstimationNombre) {
    if (!!estimation && !!estimation.nonCompte) {
      this.controlGroup.controls.nombre.disable();
      this.controlGroup.controls.nombre.setValue(null);
    } else {
      this.controlGroup.controls.nombre.enable();

      if (!!!this.controlGroup.controls.nombre.value) {
        // Set default value
        this.controlGroup.controls.nombre.setValue(this.defaultNombre);
      }
    }
  }

  public displayEstimationNombreFormat = (
    estimation: EstimationNombre
  ): string => {
    return !!estimation ? estimation.libelle : null;
  }
}
