import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { P2pJsonRpcService } from '../p2p-json-rpc.service';
import { Pokemon, TradeService } from '../trade.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
})
export class MainViewComponent {
  get isConnected() {
    return !!this.p2pJsonRpcService.otherPeerId;
  }

  get otherPeerId() {
    return this.p2pJsonRpcService.otherPeerId;
  }

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
    private p2pJsonRpcService: P2pJsonRpcService,
    public tradeService: TradeService
  ) {}

  async setOwnPokemon() {
    const localPokemon: Pokemon[] = [];
    const count = 1 + Math.floor(Math.random() * 5);
    for (let index = 0; index < count; index++) {
      localPokemon.push({
        name: 'Pokemon ' + Math.random(),
        nationalDexId: 1 + Math.floor(Math.random() * 500),
      });
    }

    await this.tradeService.setLocalPokemon(localPokemon);
  }
}
