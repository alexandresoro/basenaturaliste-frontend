import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: any, caught: any) => {
        if (err instanceof HttpErrorResponse) {
          // In case of HTTP error, redirect to the error page
          const errorPageParams: NavigationExtras = {
            state: {
              error: JSON.stringify(err)
            },
            skipLocationChange: true
          };
          this.router.navigate(["/error"], errorPageParams);
        }
        return of(err);
      })
    );
  }
}
