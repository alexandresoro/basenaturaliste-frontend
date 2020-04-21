import { Location } from "@angular/common";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { EntiteSimple } from "ouca-common/entite-simple.object";
import { combineLatest, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { EntitiesStoreService } from "src/app/services/entities-store.service";

export abstract class EntiteSimpleEditAbstractComponent<
  T extends EntiteSimple
> {
  constructor(
    protected entitiesStoreService: EntitiesStoreService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected location: Location
  ) {}

  private form: FormGroup;

  private entityToDisplay$: Observable<{
    entity: T;
    isEditingMode: boolean;
  }>;

  protected initialize(): void {
    this.entityToDisplay$ = combineLatest(
      this.route.paramMap,
      this.route.data
    ).pipe(
      switchMap(([params, data]) => {
        const isEditingMode: boolean = data.isEditingMode;
        const id = Number(params.get("id"));
        return this.getEntities$().pipe(
          map((entities) => {
            const entityMatching = _.find(entities, (entity) => {
              return entity.id === id;
            });
            return {
              entity: entityMatching,
              isEditingMode
            };
          })
        );
      })
    );

    this.form = this.createForm();

    this.entityToDisplay$.subscribe((entityToDisplay) => {
      if (entityToDisplay?.entity) {
        this.form.reset(this.getFormValue(entityToDisplay.entity));
      } else if (!entityToDisplay.isEditingMode) {
        this.form.reset();
      } else {
        this.location.back();
      }
    });
  }

  public saveEntity = <E extends EntiteSimple>(formValue: any): void => {
    const entityName = this.getEntityName();
    const entity: E = this.getEntityFromFormValue<E>(formValue);

    this.entitiesStoreService
      .saveEntity(entity, entityName)
      .subscribe((isSuccessful) => {
        if (isSuccessful) {
          this.updateEntities();
          this.backToEntityPage();
        }
      });
  };

  public backToEntityPage = (): void => {
    this.router.navigate(["/" + this.getEntityName()]);
  };

  abstract getEntityName(): string;

  abstract getEntities$(): Observable<T[]>;

  abstract updateEntities(): void;

  protected getFormValue(entity: T): any {
    return entity;
  }

  public getIsEditionMode$ = (): Observable<boolean> => {
    return this.entityToDisplay$.pipe(
      map((entity) => (entity?.isEditingMode ? true : false))
    );
  };

  protected getEntityFromFormValue<E extends EntiteSimple>(formValue: any): E {
    return formValue as E;
  }

  abstract getFormType(): any;

  abstract createForm(): FormGroup;

  public getForm = (): FormGroup => {
    return this.form;
  };
}
