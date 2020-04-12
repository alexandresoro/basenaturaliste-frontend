import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfiguration } from "ouca-common/app-configuration.object";
import { ConfigurationPage } from "ouca-common/configuration-page.object";
import { CoordinatesSystemType } from "ouca-common/coordinates-system";
import { CreationPage } from "ouca-common/creation-page.object";
import { DonneeWithNavigationData } from "ouca-common/donnee-with-navigation-data.object";
import { Donnee } from "ouca-common/donnee.object";
import { DonneesFilter } from "ouca-common/donnees-filter.object";
import { EntiteSimple } from "ouca-common/entite-simple.object";
import { FlatDonnee } from "ouca-common/flat-donnee.object";
import { Inventaire } from "ouca-common/inventaire.object";
import { Lieudit } from "ouca-common/lieudit.object";
import { PostResponse } from "ouca-common/post-response.object";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BackendApiService {
  private ALL: string = "all";
  private CONFIGURATION: string = "configuration/";
  private CREATION: string = "creation/";
  private DATABASE: string = "database/";
  private DELETE: string = "delete";
  private DONNEE: string = "donnee/";
  private EXPORT: string = "export";
  private FIND: string = "find";
  private FIND_ID: string = "find_id";
  private FIND_WITH_CONTEXT: string = "find_with_context";

  private IMPORT: string = "import";
  private INIT: string = "init";
  private COORDINATES_SYSTEM: string = "coordinates_system";
  private INVENTAIRE: string = "inventaire/";
  private LIEUDIT: string = "lieudit/";
  private NEXT_DONNEE: string = "next_donnee";
  private NEXT_REGROUPEMENT: string = "next_regroupement";
  private PREVIOUS_DONNEE: string = "previous_donnee";
  private UPDATE: string = "update";
  private SAVE: string = "save";
  private LAST: string = "last";
  private SEARCH: string = "search";
  private SEARCH_BY_COMMUNE: string = "search_by_commune/";

  private readonly FILE_TO_IMPORT_NAME: string = "fileToImport";

  constructor(public http: HttpClient) {}

  private getApiUrl = (): string => {
    return (
      window.location.protocol +
      "//" +
      window.location.hostname +
      ":" +
      window.location.port +
      "/api/"
    );
  };

  private httpGet<T>(relativePath: string): Observable<T> {
    const requestPath: string = this.getApiUrl() + relativePath;
    console.log("GET ", requestPath);
    return this.http.get<T>(requestPath);
  }

  private httpGetObserveResponse<T>(
    relativePath: string
  ): Observable<HttpResponse<any>> {
    const requestPath: string = this.getApiUrl() + relativePath;
    console.log("GET ", requestPath);
    const httpOptions: Record<string, any> = {
      observe: "response",
      responseType: "blob" as "json",
    };
    return this.http.get<any>(requestPath, httpOptions);
  }

  private httpPostObserveResponse<T>(
    relativePath: string,
    objectToPost: any
  ): Observable<HttpResponse<any>> {
    const requestPath: string = this.getApiUrl() + relativePath;
    console.log("POST", requestPath, objectToPost);
    const httpOptions: Record<string, any> = {
      observe: "response",
      responseType: "blob" as "json",
    };
    return this.http.post<any>(requestPath, objectToPost, httpOptions);
  }

  private httpPost<T>(
    relativePath: string,
    objectToPost: object
  ): Observable<T> {
    const requestPath: string = this.getApiUrl() + relativePath;
    console.log("POST", requestPath, objectToPost);
    return this.http.post<T>(requestPath, objectToPost);
  }

  public getConfigurationInitialPageModel(): Observable<ConfigurationPage> {
    return this.httpGet(this.CONFIGURATION + this.INIT);
  }

  public saveAppConfiguration = (
    appConfigurationToSave: AppConfiguration
  ): Observable<any[]> => {
    return this.httpPost(
      this.CONFIGURATION + this.UPDATE,
      appConfigurationToSave
    );
  };

  public getAppCoordinatesSystem$(): Observable<CoordinatesSystemType> {
    return this.httpGet(this.CONFIGURATION + this.COORDINATES_SYSTEM);
  }

  public importData(
    entityName: string,
    file: File
  ): Observable<HttpResponse<any>> {
    const formData: FormData = new FormData();
    formData.append(this.FILE_TO_IMPORT_NAME, file, file.name);
    return this.httpPostObserveResponse(
      entityName + "/" + this.IMPORT,
      formData
    );
  }

  public exportData(entityName: string): Observable<HttpResponse<any>> {
    return this.httpGetObserveResponse(entityName + "/" + this.EXPORT);
  }

  public getCreationInitialPageModel(): Observable<CreationPage> {
    return this.httpGet(this.CREATION + this.INIT);
  }

  public getNextDonnee(id: number): Observable<Donnee> {
    return this.httpGet(this.DONNEE + this.NEXT_DONNEE + "?id=" + id);
  }

  public getPreviousDonnee(id: number): Observable<Donnee> {
    return this.httpGet(this.DONNEE + this.PREVIOUS_DONNEE + "?id=" + id);
  }

  public deleteDonnee(
    donneeId: number,
    inventaireId: number
  ): Observable<PostResponse> {
    return this.httpGet(
      this.DONNEE +
        this.DELETE +
        "?donneeId=" +
        donneeId +
        "&inventaireId=" +
        inventaireId
    );
  }

  public getDonneeByIdWithContext(
    id: number
  ): Observable<DonneeWithNavigationData> {
    return this.httpGet(this.DONNEE + this.FIND_WITH_CONTEXT + "?id=" + id);
  }

  public getLastDonneeId(): Observable<number> {
    return this.httpGet(this.DONNEE + this.LAST);
  }

  public getNextRegroupement(): Observable<number> {
    return this.httpGet(this.DONNEE + this.NEXT_REGROUPEMENT);
  }

  public getLieuxditsByCommuneId(idCommune: number): Observable<Lieudit[]> {
    return this.httpGet(this.LIEUDIT + this.SEARCH_BY_COMMUNE + idCommune);
  }

  public saveDonnee(donneeToSave: Donnee): Observable<PostResponse> {
    return this.httpPost(this.DONNEE + this.SAVE, donneeToSave);
  }

  public saveInventaire(
    inventaireToSave: Inventaire
  ): Observable<PostResponse> {
    return this.httpPost(this.INVENTAIRE + this.SAVE, inventaireToSave);
  }

  public getInventaireById(id: number): Observable<Inventaire> {
    return this.httpGet(this.INVENTAIRE + this.FIND + "?id=" + id);
  }

  public getInventaireIdById(id: number): Observable<number> {
    return this.httpGet(this.INVENTAIRE + this.FIND_ID + "?id=" + id);
  }

  public getEntityInitialPageModel(
    entityName: string
  ): Observable<CreationPage> {
    return this.httpGet(entityName + "/" + this.INIT);
  }

  public saveEntity<T extends EntiteSimple>(
    entityName: string,
    entityToSave: T
  ): Observable<PostResponse> {
    return this.httpPost(entityName + "/" + this.SAVE, entityToSave);
  }

  public deleteEntity(
    entityName: string,
    id: number
  ): Observable<PostResponse> {
    return this.httpGet(entityName + "/" + this.DELETE + "?id=" + id);
  }

  public getAllEntities(entityName: string): Observable<EntiteSimple[]> {
    return this.httpGet(entityName + "/" + this.ALL);
  }

  public exportAllEntities(entityName: string): Observable<any[]> {
    return this.httpGet(entityName + "/" + this.EXPORT);
  }

  public getDonneesByCustomizedFilters(
    parameters: DonneesFilter
  ): Observable<FlatDonnee[]> {
    return this.httpPost(this.DONNEE + this.SEARCH, parameters);
  }

  public exportDonneesByCustomizedFilters(
    parameters: DonneesFilter
  ): Observable<HttpResponse<any>> {
    return this.httpPostObserveResponse(this.DONNEE + this.EXPORT, parameters);
  }

  public saveDatabase(): Observable<HttpResponse<any>> {
    return this.httpGetObserveResponse(this.DATABASE + this.SAVE);
  }
}
