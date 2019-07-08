import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Age } from "../../../../../basenaturaliste-model/age.object";
import { AppConfiguration } from "../../../../../basenaturaliste-model/app-configuration.object";
import { Departement } from "../../../../../basenaturaliste-model/departement.object";
import { EstimationNombre } from "../../../../../basenaturaliste-model/estimation-nombre.object";
import { Observateur } from "../../../../../basenaturaliste-model/observateur.object";
import { Sexe } from "../../../../../basenaturaliste-model/sexe.object";

@Component({
  selector: "configuration-form",
  templateUrl: "./configuration-form.tpl.html"
})
export class ConfigurationFormComponent {
  @Input() public observateurs: Observateur[];

  @Input() public departements: Departement[];

  @Input() public estimationsNombre: EstimationNombre[];

  @Input() public sexes: Sexe[];

  @Input() public ages: Age[];

  @Input() public model: AppConfiguration;

  @Output() public confirm: EventEmitter<AppConfiguration> = new EventEmitter();

  @Output() public back: EventEmitter<boolean> = new EventEmitter();

  public save(): void {
    this.confirm.emit(this.model);
  }

  public cancel(): void {
    this.back.emit();
  }
}
