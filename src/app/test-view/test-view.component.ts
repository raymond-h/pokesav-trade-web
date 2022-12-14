import { Component, OnInit } from '@angular/core';
import { PokemonData } from '../pokemon-party/pokemon-party.component';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-test-view',
  templateUrl: './test-view.component.html',
  styleUrls: ['./test-view.component.css'],
})
export class TestViewComponent implements OnInit {
  canReadyLocalSelection(): boolean {
    return false;
  }
  readyLocalSelection() {
    throw new Error('Method not implemented.');
  }

  canCancelReady(): boolean {
    return false;
  }
  cancelReady() {
    throw new Error('Method not implemented.');
  }

  canConfirm(): boolean {
    return false;
  }
  confirm() {
    throw new Error('Method not implemented.');
  }

  localSelectedPokemon(): PokemonData | null {
    return null;
  }
  remoteSelectedPokemon(): PokemonData | null {
    return null;
  }

  isLocalConfirmed() {
    return true;
  }
  isRemoteConfirmed(): boolean {
    return false;
  }

  data: PokemonData[] = [
    {
      name: 'MON',
      nationalDexId: 495,
      level: 5,
    },
    {
      name: 'SnailMouse',
      nationalDexId: 26,
      level: 20,
    },
    {
      name: 'Nix',
      nationalDexId: 615,
      level: 14,
    },
    {
      name: 'Nostalgia',
      nationalDexId: 278,
      level: 18,
    },
    {
      name: 'Baha Brain',
      nationalDexId: 54,
      level: 12,
    },
    {
      name: 'Sherbet',
      nationalDexId: 353,
      level: 12,
    },
  ];

  selectedA = 0;
  selectedB = 0;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    // setInterval(() => {
    //   this.toastService.show({
    //     title: 'Wowie',
    //     body: 'Kebab damn am I thirsty',
    //   });
    // }, 1000);
  }
}
