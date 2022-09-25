import { Injectable } from '@angular/core';
import {
  JSONRPCClient,
  JSONRPCServer,
  JSONRPCServerAndClient,
} from 'json-rpc-2.0';
import Peer, { DataConnection } from 'peerjs';

@Injectable({
  providedIn: 'root',
})
export class P2pJsonRpcService {
  serverAndClient: JSONRPCServerAndClient<void, void>;

  peer: Peer;
  peerId: string | null = null;

  otherPeerId: string | null = null;
  private connection: DataConnection | null = null;

  constructor() {
    this.peer = new Peer();

    this.serverAndClient = new JSONRPCServerAndClient(
      new JSONRPCServer(),
      new JSONRPCClient(async (req) => {
        this.connection?.send(req);
      })
    );

    this.serverAndClient.addMethod('echo', (params) => params);

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

    conn
      .on('data', (data) => {
        this.serverAndClient.receiveAndSend(data);
      })
      .once('close', () => {
        this.otherPeerId = null;
        this.connection = null;
      });

    this.otherPeerId = conn.peer;
  }

  async connect(otherPeerId: string) {
    await this.setConnection(this.peer.connect(otherPeerId));
  }
}
