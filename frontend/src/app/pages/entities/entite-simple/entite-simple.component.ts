// tslint:disable:variable-name

import { Component, OnInit } from "@angular/core";
import { Http, Response } from "@angular/http";
import { EntiteSimple } from "../../../model/entite-simple.object";
import { GestionMode } from "../gestion-mode.enum";
import { GestionModeHelper } from "./../gestion-mode.enum";

// TODO
const BASE_NATURALISTE_URL: string = "http://localhost:3000/api/";

@Component({
    template: "",
})
export class EntiteSimpleComponent<T extends EntiteSimple> implements OnInit {

    public _messages: any[];

    public status: string;

    private _objects: T[];

    private _objectToSave: T;

    private _objectToView: T;

    private _objectToRemove: T;

    private _mode: GestionMode;

    constructor(private _http: Http,
                public modeHelper: GestionModeHelper) {
    }

    public ngOnInit(): void {
        this.switchToViewAllMode();

        // Get all objects
        this.getAll();
    }

    public getAll(): void {
        this.clearMessages();
        this._http.get(BASE_NATURALISTE_URL + this.getEntityName() + "/all")
            .subscribe((response: Response) => {
                console.log("TOUS LES OBJETS:", response.json());
                this._objects = response.json();
            }, (error: Response) => {
                this.status = "ERROR";
                this._messages = ["Impossible de trouver les objets (Erreur " + error.status + ")"];
            });

    }

    public getEntityName(): string {
        return "";
    }

    public getNewObject(): T {
        return null;
    }

    public newObject(): void {
        this.switchToCreationMode();
    }

    public exportObjects(): void {
        // TODO
    }

    public deleteObject(object: T): void {
        this.switchToRemoveMode(object);
    }

    public confirmObjectRemoval(object: T): void {
        if (!!object) {
            this._http.delete(BASE_NATURALISTE_URL + this.getEntityName() + "/delete/" + object.id)
                .subscribe(
                    (response: Response) => {
                        const result = response.json();
                        this.status = result.status;
                        if (this.status === "SUCCESS") {
                            const index = this._objects.indexOf(object);
                            if (index > -1) {
                                this._objects.splice(index, 1);
                            }
                            this.switchToViewAllMode();
                        }
                        this._messages = result.messages;
                    },
                    (error: Response) => {
                        // tslint:disable-next-line:max-line-length
                        console.error("ERREUR lors de la suppression de l'objet de type " + this.getEntityName(), object, error);
                    },
            );
        } else {
            this.switchToViewAllMode();
        }
    }

    public editObject(object: T): void {
        this.switchToEditionMode(object);
    }

    public viewObject(object: T): void {
        this.switchToViewOneMode(object);
    }

    public viewAll(): void {
        this.switchToViewAllMode();
    }

    public saveObject(): void {
        let action: string = this.getEntityName() + "/create";
        if (this.modeHelper.isEditionMode(this._mode)) {
            action = this.getEntityName() + "/update";
        }

        console.log("Start saving " + this.getEntityName(), this._objectToSave);

        this._http.post(BASE_NATURALISTE_URL + action, this._objectToSave)
            .subscribe(
                (response: Response) => {
                    const result = response.json();
                    this.status = result.status;
                    if (this.status === "SUCCESS") {
                        if (this.modeHelper.isCreationMode(this._mode)) {
                            // Add the new entity in the list
                            this.objects[this.objects.length] = result.object;
                        }
                        this.switchToViewAllMode();
                    }
                    this._messages = result.messages;
                },
                (error: Response) => {
                    console.error("ERREUR: lors de la sauvegarde de l'objet de type " + this.getEntityName(),
                        this._objectToSave, error);
                });
    }

    public cancelEdition(): void {
        this.clearMessages();
        this.switchToViewAllMode();
    }

    private switchToCreationMode(): void {
        this.clearMessages();
        this._objectToSave = this.getNewObject();
        this._mode = GestionMode.CREATION;
    }

    private switchToEditionMode(object: T): void {
        this.clearMessages();
        this._objectToSave = object; // TODO make a copy
        this._mode = GestionMode.EDITION;
    }

    private switchToViewAllMode(): void {
        this._objectToSave = this.getNewObject();
        this._mode = GestionMode.VIEW_ALL;
    }

    private switchToViewOneMode(object: T): void {
        this.clearMessages();
        this._objectToView = object;
        this._mode = GestionMode.VIEW_ONE;
    }

    private switchToRemoveMode(object: T): void {
        this.clearMessages();
        this._objectToRemove = object; // TODO make a copy
        this._mode = GestionMode.REMOVE;
    }

    private clearMessages(): void {
        this._messages = [];
    }

    // *** GETTERS *** //

    get objectToSave(): T {
        return this._objectToSave;
    }

    get objectToView(): T {
        return this._objectToView;
    }

    get objectToRemove(): T {
        return this._objectToRemove;
    }

    get objects(): T[] {
        return this._objects;
    }

    get mode(): GestionMode {
        return this._mode;
    }

    get messages(): any[] {
        return this._messages;
    }
}
