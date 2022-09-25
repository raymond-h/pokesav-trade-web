import { TestBed } from '@angular/core/testing';

import { P2pJsonRpcService } from './p2p-json-rpc.service';

describe('P2pJsonRpcService', () => {
  let service: P2pJsonRpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(P2pJsonRpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
