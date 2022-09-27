import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Buffer } from 'buffer';
import { fromBuffer } from 'pokesav-ds-gen5';
import { downloadBlob } from 'src/lib/download-blob';
import { metadataFromPokesavObject } from 'src/lib/savefile-pokesav-compatibility-black-white-1';
import { P2pJsonRpcService } from '../p2p-json-rpc.service';
import { Pokemon, TradeService } from '../trade.service';

async function blobToBufferAsync(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css'],
})
export class MainViewComponent {
  fileName: string | null = null;
  fileBuffer: Buffer | null = null;

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

  async onSavefileChanged(event: Event) {
    const files = (<HTMLInputElement>event.target).files!;

    const fileBuffer = await blobToBufferAsync(files[0]);

    const parsed = fromBuffer(fileBuffer);
    if (!parsed) {
      throw new Error('Unable to detect file as being a BW1 savefile');
    }

    this.fileName = files[0].name;
    this.fileBuffer = fileBuffer;

    const party: Pokemon[] = parsed.partyPokemonBlock.partyPokemon
      .map((pkmn) => metadataFromPokesavObject(pkmn.base))
      .map((pkmn) => ({ name: pkmn.nickname, nationalDexId: pkmn.species }));

    console.log('File changed', parsed.trainerDataBlock.trainerName, party);

    await this.tradeService.setLocalPokemon(
      parsed.trainerDataBlock.trainerName,
      party
    );
  }

  downloadCurrentFileBuffer() {
    const fileName = this.fileName;
    const fileBuffer = this.fileBuffer;
    if (!fileBuffer || !fileName) return;

    const blob = new Blob([fileBuffer.buffer]);
    downloadBlob(blob, fileName);
  }

  async setOwnPokemon() {
    const localPokemon: Pokemon[] = [];
    const count = 1 + Math.floor(Math.random() * 5);
    for (let index = 0; index < count; index++) {
      localPokemon.push({
        name: 'Pokemon ' + Math.random(),
        nationalDexId: 1 + Math.floor(Math.random() * 500),
      });
    }

    await this.tradeService.setLocalPokemon('Lol Random', localPokemon);
  }
}
