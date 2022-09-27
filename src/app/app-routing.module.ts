import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectLinkViewComponent } from './connect-link-view/connect-link-view.component';
import { MainViewComponent } from './main-view/main-view.component';
import { TestViewComponent } from './test-view/test-view.component';

const routes: Routes = [
  { path: 'test', component: TestViewComponent },
  { path: 'connect/:peerId', component: ConnectLinkViewComponent },
  { path: '', pathMatch: 'full', component: MainViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
