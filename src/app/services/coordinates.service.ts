import { Injectable } from "@angular/core";
import { CoordinatesSystemType } from "ouca-common/coordinates-system";
import { BehaviorSubject } from "rxjs";
import { BackendApiService } from "../modules/shared/services/backend-api.service";

@Injectable({
  providedIn: "root"
})
export class CoordinatesService {
  private appCoordinatesSystem$: BehaviorSubject<
    CoordinatesSystemType
  > = new BehaviorSubject<CoordinatesSystemType>(null);

  constructor(private backendApiService: BackendApiService) {}

  public getAppCoordinatesSystem = (): CoordinatesSystemType => {
    return this.appCoordinatesSystem$.value;
  };

  public initAppCoordinatesSystem = (): void => {
    this.backendApiService.getAppCoordinatesSystem$().subscribe((system) => {
      this.appCoordinatesSystem$.next(system);
    });
  };
}