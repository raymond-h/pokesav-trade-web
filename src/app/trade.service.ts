import { Injectable, NgZone } from '@angular/core';
import { JSONRPCServerAndClient } from 'json-rpc-2.0';
import {
  BehaviorSubject,
  delay,
  filter,
  map,
  merge,
  mergeMap,
  pairwise,
  Subject,
  tap,
} from 'rxjs';
import * as y from 'yup';
import { isEqual, cloneDeep } from 'lodash';
import { P2pJsonRpcService } from './p2p-json-rpc.service';
import { withRetry } from 'src/lib/retry-promise';
import {
  getPokemonInParty,
  injectPokemonAsIfByTrading,
  PokemonMetadata,
} from 'src/lib/savefile-modifier/black-white-1';
import { metadataFromPokesavObject } from 'src/lib/savefile-pokesav-compatibility-black-white-1';
import { fromBuffer, PokesavDsGen5 } from 'pokesav-ds-gen5';
import * as kaitaiStruct from 'kaitai-struct';

type ArgumentsOf<F> = F extends (...args: infer A) => any ? A : never;

const pokemonSchema = y.object({
  name: y.string().required(),
  nationalDexId: y.number().required().integer(),
  level: y.number().required().integer(),
});

export type Pokemon = y.InferType<typeof pokemonSchema>;

const setRemoteStateArgsSchema = y.object({
  pokemon: y.array(pokemonSchema),
  toTradeIndex: y.number().nullable(),
  ready: y.boolean(),
  confirmed: y.boolean(),
  fetched: y.boolean(),
});

const fetchPokemonDataArgsSchema = y.object({
  partyIndex: y.number().required(),
});

interface TradeUserState {
  trainerName: string | null;
  pokemon: Pokemon[];
  toTradeIndex: number | null;
  state: 'selecting-pokemon' | 'ready' | 'confirmed' | 'fetched';
}

export interface TradeState {
  local: TradeUserState;
  remote: TradeUserState;
}

type TradeStateChanges = Partial<TradeUserState>;

function isReady(userState: TradeUserState) {
  return userState.state === 'ready' && userState.toTradeIndex != null;
}

export function hasConfirmed(userState: TradeUserState) {
  return userState.state === 'confirmed' || userState.state === 'fetched';
}

function areBothPartiesConfirmed(state: TradeState) {
  return hasConfirmed(state.local) && hasConfirmed(state.remote);
}

function haveBothPartiesFetched(state: TradeState) {
  return state.local.state === 'fetched' && state.remote.state === 'fetched';
}

function updateState(
  state: TradeState,
  side: 'local' | 'remote',
  changes: TradeStateChanges
): TradeState {
  const newState = cloneDeep(state);

  if (typeof changes.trainerName !== 'undefined')
    newState[side].trainerName = changes.trainerName;
  if (typeof changes.pokemon !== 'undefined')
    newState[side].pokemon = changes.pokemon;
  if (typeof changes.toTradeIndex !== 'undefined')
    newState[side].toTradeIndex = changes.toTradeIndex;
  if (typeof changes.state !== 'undefined')
    newState[side].state = changes.state;

  return newState;
}

const initialState: TradeState = {
  local: {
    trainerName: null,
    pokemon: [],
    toTradeIndex: null,
    state: 'selecting-pokemon',
  },

  remote: {
    trainerName: null,
    pokemon: [],
    toTradeIndex: null,
    state: 'selecting-pokemon',
  },
};

export interface FileData {
  name: string;
  buffer: Buffer;
}

export interface SuccessfulTradeInfo {
  sentPokemonMetadata: PokemonMetadata;
  receivedPokemonMetadata: PokemonMetadata;
}

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  private get serverAndClient() {
    return this.p2pJsonRpcService.serverAndClient;
  }

  fileData: FileData | null = null;
  temporaryPokemonBufferStorage: Buffer | null = null;

  state = new BehaviorSubject<TradeState>(initialState);

  onSuccessfulTrade = new Subject<SuccessfulTradeInfo>();

  constructor(zone: NgZone, private p2pJsonRpcService: P2pJsonRpcService) {
    const addJsonRpcMethod = (
      ...[methodName, fn]: ArgumentsOf<JSONRPCServerAndClient['addMethod']>
    ) => {
      this.serverAndClient.addMethod(methodName, (...args) =>
        zone.run(() => fn(...args))
      );
    };

    addJsonRpcMethod('setRemoteState', async (rawArgs) => {
      const changes = await setRemoteStateArgsSchema.validate(rawArgs);

      this.state.next(updateState(this.state.getValue(), 'remote', changes));
    });

    addJsonRpcMethod('fetchPokemonData', async (rawArgs) => {
      const { partyIndex } = await fetchPokemonDataArgsSchema.validate(rawArgs);
      const state = this.state.getValue();

      if (!areBothPartiesConfirmed(state))
        throw new Error('Trade has not been confirmed yet');

      if (partyIndex !== state.local.toTradeIndex)
        throw new Error(
          `Tried to fetch wrong Pokemon data - expected ${state.local.toTradeIndex}, was actually ${partyIndex}`
        );

      const fileData = this.fileData;
      if (!fileData)
        throw new Error(
          'Somehow a trade was done with no file data available - this should never happen'
        );

      return getPokemonInParty(fileData.buffer, partyIndex).toString('base64');
    });

    p2pJsonRpcService.onOpen.subscribe(async () => {
      const state = this.state.getValue();
      await this.setLocalPokemon(state.local.trainerName, state.local.pokemon);
    });

    p2pJsonRpcService.onClose.subscribe(() =>
      zone.run(() => {
        this.state.next(initialState);
      })
    );

    const resetIfRemoteChangesPokemonObs = this.state.pipe(
      map((state) => state.remote.pokemon),
      pairwise(),
      filter(([prev, curr]) => !isEqual(prev, curr)),
      tap(() => {
        this.setLocalState({
          toTradeIndex: null,
          state: 'selecting-pokemon',
        });
      })
    );

    const resetIfRemoteCancelsReadyObs = this.state.pipe(
      pairwise(),
      filter(
        ([prevState, currState]) =>
          hasConfirmed(prevState.local) &&
          isReady(prevState.remote) &&
          currState.remote.state === 'selecting-pokemon'
      ),
      tap(() => {
        this.setLocalState({
          state: 'ready',
        });
      })
    );

    const doTradeObs = this.state.pipe(
      pairwise(),
      filter(
        ([prevState, state]) =>
          !areBothPartiesConfirmed(prevState) && areBothPartiesConfirmed(state)
      ),
      mergeMap(async ([, state]) => {
        const pokemonData = await withRetry(
          async () => {
            return await this.serverAndClient.request('fetchPokemonData', {
              partyIndex: state.remote.toTradeIndex,
            });
          },
          { minTimeout: 100 }
        )();

        // TODO actually merge into savefile
        this.temporaryPokemonBufferStorage = Buffer.from(pokemonData, 'base64');
        console.log('Got data', this.temporaryPokemonBufferStorage);

        this.setLocalState({ state: 'fetched' });
      })
    );

    const resetStateAfterTradeObs = this.state.pipe(
      pairwise(),
      filter(
        ([prevState, state]) =>
          !haveBothPartiesFetched(prevState) && haveBothPartiesFetched(state)
      ),
      delay(100),
      mergeMap(async ([, state]) => {
        const pkmnBuffer = this.temporaryPokemonBufferStorage;
        const fileData = this.fileData;
        if (
          pkmnBuffer == null ||
          fileData == null ||
          state.local.toTradeIndex == null
        ) {
          throw new Error(
            'Expected both original savefile and traded Pokemon data to be available'
          );
        }

        const originalMetadata = metadataFromPokesavObject(
          new PokesavDsGen5.Pokemon(
            new kaitaiStruct.KaitaiStream(
              getPokemonInParty(fileData.buffer, state.local.toTradeIndex)
            )
          )
        );

        const metadata = metadataFromPokesavObject(
          new PokesavDsGen5.Pokemon(new kaitaiStruct.KaitaiStream(pkmnBuffer))
        );

        console.log('Traded metadata', metadata);

        const newFileBuffer = Buffer.from(fileData.buffer);
        injectPokemonAsIfByTrading(
          newFileBuffer,
          state.local.toTradeIndex,
          pkmnBuffer,
          metadata
        );

        this.setLocalState({
          toTradeIndex: null,
          state: 'selecting-pokemon',
        });
        await this.setFileData({
          name: fileData.name,
          buffer: newFileBuffer,
        });

        this.onSuccessfulTrade.next({
          sentPokemonMetadata: originalMetadata,
          receivedPokemonMetadata: metadata,
        });
      })
    );

    merge(
      resetIfRemoteChangesPokemonObs,
      resetIfRemoteCancelsReadyObs,
      doTradeObs,
      resetStateAfterTradeObs
    ).subscribe({
      error(err) {
        console.error(err);
      },
    });
  }

  private setLocalState(changes: TradeStateChanges) {
    this.serverAndClient.notify('setRemoteState', changes);
    this.state.next(updateState(this.state.getValue(), 'local', changes));
  }

  async setFileData(fileData: FileData) {
    this.fileData = fileData;

    const parsed = fromBuffer(fileData.buffer);

    const party: Pokemon[] = parsed.partyPokemonBlock.partyPokemon.map(
      (pkmn) => {
        const meta = metadataFromPokesavObject(pkmn.base);

        return {
          name: meta.name,
          nationalDexId: meta.species,
          level: pkmn.battleStats.level,
        };
      }
    );

    console.log('File changed', parsed.trainerDataBlock.trainerName, party);

    await this.setLocalPokemon(parsed.trainerDataBlock.trainerName, party);
  }

  async setLocalPokemon(trainerName: string | null, pokemon: Pokemon[]) {
    this.setLocalState({
      trainerName,
      pokemon,
      toTradeIndex: null,
      state: 'selecting-pokemon',
    });
  }

  canSetToTradeIndex(toTradeIndex: number) {
    const state = this.state.getValue();

    return (
      state.local.state === 'selecting-pokemon' &&
      toTradeIndex >= 0 &&
      toTradeIndex < state.local.pokemon.length
    );
  }

  setToTradeIndex(toTradeIndex: number) {
    if (!this.canSetToTradeIndex(toTradeIndex)) return;

    this.setLocalState({
      toTradeIndex,
    });
  }

  canReadyLocalSelection() {
    const state = this.state.getValue();

    return (
      state.local.state === 'selecting-pokemon' &&
      state.local.toTradeIndex != null
    );
  }

  readyLocalSelection() {
    if (!this.canReadyLocalSelection()) return;

    this.setLocalState({
      state: 'ready',
    });
  }

  canCancelReady() {
    const state = this.state.getValue();

    return isReady(state.local);
  }

  cancelReady() {
    if (!this.canCancelReady()) return;

    this.setLocalState({
      toTradeIndex: null,
      state: 'selecting-pokemon',
    });
  }

  canConfirm() {
    const state = this.state.getValue();

    return (
      isReady(state.local) &&
      (isReady(state.remote) || hasConfirmed(state.remote))
    );
  }

  confirm() {
    if (!this.canConfirm()) return;

    this.setLocalState({
      state: 'confirmed',
    });
  }
}
