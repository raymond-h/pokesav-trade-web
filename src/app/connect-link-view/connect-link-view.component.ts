import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { P2pJsonRpcService } from '../p2p-json-rpc.service';

@Component({
  selector: 'app-connect-link-view',
  templateUrl: './connect-link-view.component.html',
  styleUrls: ['./connect-link-view.component.css'],
})
export class ConnectLinkViewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private p2pJsonRpcService: P2pJsonRpcService
  ) {}

  async ngOnInit() {
    const peerId = this.route.snapshot.paramMap.get('peerId')!;

    console.log('Connecting to', peerId);

    await this.p2pJsonRpcService.connect(peerId);

    console.log('We done connecting');

    await this.router.navigate(['/']);
  }
}
