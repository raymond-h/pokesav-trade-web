import { Injectable } from '@angular/core';
import {
  JSONRPCClient,
  JSONRPCServer,
  JSONRPCServerAndClient,
} from 'json-rpc-2.0';
import Peer, { DataConnection } from 'peerjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class P2pJsonRpcService {
  serverAndClient: JSONRPCServerAndClient<void, void>;

  peer: Peer | null = null;
  peerId: string | null = null;

  otherPeerId: string | null = null;
  private connection: DataConnection | null = null;

  onOpen = new Subject<void>();
  onClose = new Subject<void>();

  constructor() {
    this.serverAndClient = new JSONRPCServerAndClient(
      new JSONRPCServer(),
      new JSONRPCClient(async (req) => {
        // console.log('[SEND]', req);
        this.connection?.send(req);
      })
    );
  }

  initialize() {
    this.peer = new Peer();

    this.peer
      .on('open', (id) => {
        console.log('We ready with ID', id);
        this.peerId = id;
      })
      .on('connection', (conn) => {
        this.setConnection(conn).catch((err) => console.error(err));
      });
  }

  isConnected() {
    return !!this.otherPeerId;
  }

  private async setConnection(conn: DataConnection) {
    if (this.connection) {
      conn.close();
      console.error(
        'Someone else tried to connect when we already got a connection'
      );
    }

    this.connection = conn;

    await new Promise<void>((resolve) => {
      conn.once('open', () => resolve());
    });

    this.onOpen.next();

    conn
      .on('data', (data) => {
        // console.log('[RECV]', data);
        this.serverAndClient.receiveAndSend(data);
      })
      .once('close', () => {
        this.serverAndClient.rejectAllPendingRequests(
          'peerjs connection closed'
        );
        this.otherPeerId = null;
        this.connection = null;
        this.onClose.next();
      });

    this.otherPeerId = conn.peer;
  }

  async connect(otherPeerId: string) {
    if (!this.peer) {
      throw new Error(
        '.connect() called before .initialize() - .initialize() must be called first'
      );
    }

    await this.setConnection(
      this.peer.connect(otherPeerId, { serialization: 'json' })
    );
  }
}
