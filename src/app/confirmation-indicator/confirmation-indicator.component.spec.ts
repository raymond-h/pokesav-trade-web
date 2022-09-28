import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationIndicatorComponent } from './confirmation-indicator.component';

describe('ConfirmationIndicatorComponent', () => {
  let component: ConfirmationIndicatorComponent;
  let fixture: ComponentFixture<ConfirmationIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationIndicatorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
