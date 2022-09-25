import { Component, OnInit } from '@angular/core';
import { P2pJsonRpcService } from './p2p-json-rpc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'pokesav-trade-web';

  constructor(public p2pJsonRpcService: P2pJsonRpcService) {}
}
