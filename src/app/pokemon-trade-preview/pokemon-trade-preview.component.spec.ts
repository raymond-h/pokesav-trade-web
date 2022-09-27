import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonTradePreviewComponent } from './pokemon-trade-preview.component';

describe('PokemonTradePreviewComponent', () => {
  let component: PokemonTradePreviewComponent;
  let fixture: ComponentFixture<PokemonTradePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokemonTradePreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonTradePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
