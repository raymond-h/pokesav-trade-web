import { Injectable, NgZone } from '@angular/core';
import { JSONRPCServerAndClient } from 'json-rpc-2.0';
import { BehaviorSubject, map } from 'rxjs';
import * as y from 'yup';
import { P2pJsonRpcService } from './p2p-json-rpc.service';

type ArgumentsOf<F> = F extends (...args: infer A) => any ? A : never;

const pokemonSchema = y.object({
  name: y.string().required(),
  nationalDexId: y.number().required().integer(),
});

export type Pokemon = y.InferType<typeof pokemonSchema>;

const setRemotePokemonArgsSchema = y.object({
  pokemon: y.array(pokemonSchema).required(),
});

export interface TradeState {
  localPokemon: Pokemon[];
  remotePokemon: Pokemon[];
}

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  private get serverAndClient() {
    return this.p2pJsonRpcService.serverAndClient;
  }

  state = new BehaviorSubject<TradeState>({
    localPokemon: [],
    remotePokemon: [],
  });

  constructor(zone: NgZone, private p2pJsonRpcService: P2pJsonRpcService) {
    const addJsonRpcMethod = (
      ...[methodName, fn]: ArgumentsOf<JSONRPCServerAndClient['addMethod']>
    ) => {
      this.serverAndClient.addMethod(methodName, (...args) =>
        zone.run(() => fn(...args))
      );
    };

    addJsonRpcMethod('setRemotePokemon', async (rawArgs) => {
      const { pokemon } = await setRemotePokemonArgsSchema.validate(rawArgs);

      this.state.next({
        ...this.state.getValue(),
        remotePokemon: pokemon,
      });
    });

    p2pJsonRpcService.onOpen.subscribe(async () => {
      await this.setLocalPokemon(this.state.getValue().localPokemon);
    });

    p2pJsonRpcService.onClose
      .pipe(
        map(() => ({
          ...this.state.getValue(),
          remotePokemon: [],
        }))
      )
      .subscribe((newState) =>
        zone.run(() => {
          this.state.next(newState);
        })
      );
  }

  async setLocalPokemon(localPokemon: Pokemon[]) {
    this.state.next({
      ...this.state.getValue(),
      localPokemon,
    });

    await this.serverAndClient.request('setRemotePokemon', {
      pokemon: localPokemon,
    });
  }
}
