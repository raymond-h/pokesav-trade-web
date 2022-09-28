import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectLinkViewComponent } from './connect-link-view/connect-link-view.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ShareLinkComponent } from './share-link/share-link.component';
import { TestViewComponent } from './test-view/test-view.component';
import { PokemonPartyComponent } from './pokemon-party/pokemon-party.component';
import { PokemonTradePreviewComponent } from './pokemon-trade-preview/pokemon-trade-preview.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastGlobalComponent } from './toast-global/toast-global.component';
import { ConfirmationIndicatorComponent } from './confirmation-indicator/confirmation-indicator.component';

@NgModule({
  declarations: [
    AppComponent,
    ConnectLinkViewComponent,
    MainViewComponent,
    ShareLinkComponent,
    TestViewComponent,
    PokemonPartyComponent,
    PokemonTradePreviewComponent,
    ToastGlobalComponent,
    ConfirmationIndicatorComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, NgbModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
