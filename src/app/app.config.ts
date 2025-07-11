import {ApplicationConfig, provideAppInitializer, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {MockServer} from "./mock-server";

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(routes),
        provideHttpClient(withInterceptors([MockServer.dispatch])),
        provideAppInitializer(() => {
            MockServer.initialize();

            // Super-hacky function to call from the console to clear the local storage. Useful when you break the
            // storage by saving invalid items. Just type `reset()` in the console to call it.
            (window as any).reset = () => {
                MockServer.clear();
                MockServer.initialize();
                console.log('Local storage cleared an initialized with mock data.');
                window.location.reload();
            }
        })
    ]
};
