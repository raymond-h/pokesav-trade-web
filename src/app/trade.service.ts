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
  tap,
} from 'rxjs';
import * as y from 'yup';
import { isEqual, cloneDeep } from 'lodash';
import { P2pJsonRpcService } from './p2p-json-rpc.service';
import { withRetry } from 'src/lib/retry-promise';

type ArgumentsOf<F> = F extends (...args: infer A) => any ? A : never;

const pokemonSchema = y.object({
  name: y.string().required(),
  nationalDexId: y.number().required().integer(),
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

function hasConfirmed(userState: TradeUserState) {
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

  if (typeof changes.pokemon !== 'undefined')
    newState[side].pokemon = changes.pokemon;
  if (typeof changes.toTradeIndex !== 'undefined')
    newState[side].toTradeIndex = changes.toTradeIndex;
  if (typeof changes.state !== 'undefined')
    newState[side].state = changes.state;

  return newState;
}

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  private get serverAndClient() {
    return this.p2pJsonRpcService.serverAndClient;
  }

  state = new BehaviorSubject<TradeState>({
    local: {
      pokemon: [],
      toTradeIndex: null,
      state: 'selecting-pokemon',
    },

    remote: {
      pokemon: [],
      toTradeIndex: null,
      state: 'selecting-pokemon',
    },
  });

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

      // TODO grab data from savefile
      return [
        'this',
        'is',
        'data',
        partyIndex,
        'from',
        p2pJsonRpcService.peerId,
      ];
    });

    p2pJsonRpcService.onOpen.subscribe(async () => {
      await this.setLocalPokemon(this.state.getValue().local.pokemon);
    });

    p2pJsonRpcService.onClose.subscribe(() =>
      zone.run(() => {
        this.state.next(
          updateState(this.state.getValue(), 'remote', {
            pokemon: [],
            toTradeIndex: null,
            state: 'selecting-pokemon',
          })
        );
      })
    );

    const resetIfRemoteChangesPokemonObs = this.state.pipe(
      map((state) => state.remote.pokemon),
      pairwise(),
      filter(([prev, curr]) => !isEqual(prev, curr)),
      mergeMap(async (x) => {
        await this.setLocalState({
          toTradeIndex: null,
          state: 'selecting-pokemon',
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
            console.log('Let us try this thing out');
            return await this.serverAndClient.request('fetchPokemonData', {
              partyIndex: state.remote.toTradeIndex,
            });
          },
          { minTimeout: 100 }
        )();

        // TODO actually merge into savefile
        console.log('Got data', pokemonData);
        console.log('Totally merging that into the savefile...');

        await this.setLocalState({ state: 'fetched' });
      })
    );

    const resetStateAfterTradeObs = this.state.pipe(
      pairwise(),
      filter(
        ([prevState, state]) =>
          !haveBothPartiesFetched(prevState) && haveBothPartiesFetched(state)
      ),
      delay(1000),
      mergeMap(async () => {
        await this.setLocalState({
          toTradeIndex: null,
          state: 'selecting-pokemon',
        });
      })
    );

    merge(
      resetIfRemoteChangesPokemonObs,
      doTradeObs,
      resetStateAfterTradeObs
    ).subscribe({
      error(err) {
        console.error(err);
      },
    });
  }

  async setLocalState(changes: TradeStateChanges) {
    await this.serverAndClient.request('setRemoteState', changes);
    this.state.next(updateState(this.state.getValue(), 'local', changes));
  }

  async setLocalPokemon(pokemon: Pokemon[]) {
    await this.setLocalState({
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

  async setToTradeIndex(toTradeIndex: number) {
    if (!this.canSetToTradeIndex(toTradeIndex)) return;

    await this.setLocalState({
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

  async readyLocalSelection() {
    if (!this.canReadyLocalSelection()) return;

    await this.setLocalState({
      state: 'ready',
    });
  }

  canCancelReady() {
    const state = this.state.getValue();

    return isReady(state.local) && !hasConfirmed(state.remote);
  }

  async cancelReady() {
    if (!this.canCancelReady()) return;

    await this.setLocalState({
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

  async confirm() {
    if (!this.canConfirm()) return;

    await this.setLocalState({
      state: 'confirmed',
    });
  }
}
