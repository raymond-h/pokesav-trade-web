import { Component, Input } from '@angular/core';

export interface PokemonData {
  name: string;
  nationalDexId: number;
  level: number;
}

@Component({
  selector: 'app-pokemon-trade-preview',
  templateUrl: './pokemon-trade-preview.component.html',
  styleUrls: ['./pokemon-trade-preview.component.css'],
})
export class PokemonTradePreviewComponent {
  @Input() localPokemon!: PokemonData | null;
  @Input() remotePokemon!: PokemonData | null;

  getIconUrl(natDexId: number) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${natDexId}.png`;
  }
}
