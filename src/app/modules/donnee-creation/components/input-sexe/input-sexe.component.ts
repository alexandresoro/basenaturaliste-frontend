import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Sexe } from "../../../../model/sexe.object";
import { AutocompleteAttribute } from "../../../shared/components/lco-autocomplete/autocomplete-attribute.object";

@Component({
  selector: "input-sexe",
  templateUrl: "./input-sexe.tpl.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputSexeComponent {
  @Input() public control: FormControl;

  @Input() public sexes: Sexe[];

  public autocompleteAttributes: AutocompleteAttribute[] = [
    {
      key: "libelle",
      exactSearchMode: false,
      startWithMode: false
    }
  ];

  private displaySexeFormat = (sexe: Sexe): string => {
    return !!sexe ? sexe.libelle : null;
  }
}
