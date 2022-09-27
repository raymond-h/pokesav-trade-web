import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PokemonData {
  name: string;
  nationalDexId: number;
  level: number;
}

@Component({
  selector: 'app-pokemon-party',
  templateUrl: './pokemon-party.component.html',
  styleUrls: ['./pokemon-party.component.css'],
})
export class PokemonPartyComponent {
  @Input() pokemonParty!: PokemonData[];

  @Input() selectedIndex!: number | null;
  @Input() showOnly!: boolean;

  @Output() selectedIndexChange = new EventEmitter<number>();

  getIconUrl(natDexId: number) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${natDexId}.png`;
  }
}
