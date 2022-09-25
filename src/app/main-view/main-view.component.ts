import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { P2pJsonRpcService } from '../p2p-json-rpc.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
})
export class MainViewComponent {
  get connectUrl() {
    const path = this.location.prepareExternalUrl(
      this.router.serializeUrl(
        this.router.createUrlTree(['/connect', this.p2pJsonRpcService.peerId])
      )
    );

    return new URL(path, window.location.href);
  }

  constructor(
    private router: Router,
    private location: Location,
    private p2pJsonRpcService: P2pJsonRpcService
  ) {}
}
