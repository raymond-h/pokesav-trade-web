import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectLinkViewComponent } from './connect-link-view/connect-link-view.component';
import { MainViewComponent } from './main-view/main-view.component';

@NgModule({
  declarations: [AppComponent, ConnectLinkViewComponent, MainViewComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
