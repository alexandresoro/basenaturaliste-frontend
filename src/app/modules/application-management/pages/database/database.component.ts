import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import moment = require("moment");
import { PageComponent } from "../../../shared/components/page.component";
import {
  getContentTypeFromResponse,
  getFileNameFromResponseContentDisposition,
  saveFile
} from "../../../shared/helpers/file-downloader.helper";
import { BackendApiService } from "../../../shared/services/backend-api.service";

@Component({
  templateUrl: "./database.tpl.html"
})
export class DatabaseComponent extends PageComponent {
  public isWaitPanelDisplayed: boolean = false;

  constructor(private backendApiService: BackendApiService) {
    super();
  }

  public onSaveDatabaseClicked(): void {
    this.displayWaitPanel();
    this.backendApiService.saveDatabase().subscribe(
      (response) => {
        console.log("Sauvegarde terminée");
        saveFile(
          response.body,
          getFileNameFromResponseContentDisposition(response),
          getContentTypeFromResponse(response)
        );
        this.hideWaitPanel();
      },
      (error) => {
        this.hideWaitPanel();
      }
    );
  }

  private displayWaitPanel(): void {
    this.isWaitPanelDisplayed = true;
  }

  private hideWaitPanel(): void {
    this.isWaitPanelDisplayed = false;
  }
}
