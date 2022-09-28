import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Buffer } from 'buffer';
import { fromBuffer } from 'pokesav-ds-gen5';
import { map, Observable, Subscription } from 'rxjs';
import { downloadBlob } from 'src/lib/download-blob';
import { metadataFromPokesavObject } from 'src/lib/savefile-pokesav-compatibility-black-white-1';
import { P2pJsonRpcService } from '../p2p-json-rpc.service';
import { ToastService } from '../toast.service';
import { hasConfirmed, Pokemon, TradeService } from '../trade.service';

async function blobToBufferAsync(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
})
export class MainViewComponent implements OnInit, OnDestroy {
  get isConnected() {
    return !!this.otherPeerId;
  }

  get otherPeerId() {
    return this.p2pJsonRpcService.otherPeerId;
    // return 'debug-id';
  }

  get hasLoadedSavefile() {
    return this.tradeService.fileData != null;
    // return true;
  }

  get connectUrl() {
    const path = this.location.prepareExternalUrl(
      this.router.serializeUrl(
        this.router.createUrlTree(['/connect', this.p2pJsonRpcService.peerId])
      )
    );

    return new URL(path, window.location.href);
  }

  localSelectedPokemon$: Observable<Pokemon | null>;
  remoteSelectedPokemon$: Observable<Pokemon | null>;
  showTradePreview$: Observable<boolean>;
  isLocalLoaded$: Observable<boolean>;
  isLocalConfirmed$: Observable<boolean>;
  isRemoteLoaded$: Observable<boolean>;
  isRemoteConfirmed$: Observable<boolean>;

  subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private p2pJsonRpcService: P2pJsonRpcService,
    public tradeService: TradeService,
    private toastService: ToastService
  ) {
    this.localSelectedPokemon$ = tradeService.state.pipe(
      map((state) =>
        state.local.state !== 'selecting-pokemon' &&
        state.local.toTradeIndex != null
          ? state.local.pokemon[state.local.toTradeIndex]
          : null
      )
    );

    this.remoteSelectedPokemon$ = tradeService.state.pipe(
      map((state) =>
        state.remote.state !== 'selecting-pokemon' &&
        state.remote.toTradeIndex != null
          ? state.remote.pokemon[state.remote.toTradeIndex]
          : null
      )
    );

    this.showTradePreview$ = tradeService.state.pipe(
      map(
        (state) =>
          state.local.pokemon.length > 0 && state.remote.pokemon.length > 0
      )
    );

    this.isLocalLoaded$ = tradeService.state.pipe(
      map((state) => state.local.pokemon.length > 0)
    );

    this.isRemoteLoaded$ = tradeService.state.pipe(
      map((state) => state.remote.pokemon.length > 0)
    );

    this.isLocalConfirmed$ = tradeService.state.pipe(
      map((state) => hasConfirmed(state.local))
    );

    this.isRemoteConfirmed$ = tradeService.state.pipe(
      map((state) => hasConfirmed(state.remote))
    );
  }

  ngOnInit(): void {
    //*
    this.tradeService.initialize();
    /*/
    this.tradeService.debugSetState({
      local: {
        trainerName: 'Bandana Dee',
        pokemon: [
          { level: 2, nationalDexId: 5, name: 'Lad' },
          { level: 14, nationalDexId: 15, name: 'Maggie' },
          { level: 54, nationalDexId: 245, name: 'Hunter' },
        ],
        toTradeIndex: null,
        state: 'selecting-pokemon',
      },

      remote: {
        trainerName: 'Larry',
        pokemon: [
          { level: 60, nationalDexId: 512, name: 'Banner' },
          { level: 20, nationalDexId: 333, name: 'Swift' },
          { level: 30, nationalDexId: 45, name: 'Cookie' },
        ],
        toTradeIndex: null,
        state: 'selecting-pokemon',
      },
    });
    //*/

    this.subscriptions.push(
      this.tradeService.onSuccessfulTrade.subscribe((info) => {
        this.toastService.show({
          title: 'Successful trade!',
          body: `Your ${info.sentPokemonMetadata.name} was successfully traded for ${info.receivedPokemonMetadata.name}!
            Click "Download savefile" to get your updated savefile with your newly received Pokemon.`,
          delay: 10_000,
        });
      }),

      this.tradeService.onConnectionClosed.subscribe(() => {
        this.toastService.show({
          title: 'Connection closed',
          body: 'The connection has been closed.',
        });
      })
    );
  }

  ngOnDestroy(): void {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }

    this.tradeService.destroy();
  }

  async onSavefileChanged(event: Event) {
    const files = (<HTMLInputElement>event.target).files!;

    const fileBuffer = await blobToBufferAsync(files[0]);

    const parsed = fromBuffer(fileBuffer);
    if (!parsed) {
      throw new Error('Unable to detect file as being a BW1 savefile');
    }

    this.tradeService.setFileData({
      name: files[0].name,
      buffer: fileBuffer,
    });
  }

  downloadCurrentFileBuffer() {
    const fileName = this.tradeService.fileData?.name;
    const fileBuffer = this.tradeService.fileData?.buffer;
    if (!fileBuffer || !fileName) return;

    const blob = new Blob([fileBuffer.buffer]);
    downloadBlob(blob, fileName);
  }
}
