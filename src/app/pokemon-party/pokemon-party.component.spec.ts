import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonPartyComponent } from './pokemon-party.component';

describe('PokemonPartyComponent', () => {
  let component: PokemonPartyComponent;
  let fixture: ComponentFixture<PokemonPartyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokemonPartyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
