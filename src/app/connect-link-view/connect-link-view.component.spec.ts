import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectLinkViewComponent } from './connect-link-view.component';

describe('ConnectLinkViewComponent', () => {
  let component: ConnectLinkViewComponent;
  let fixture: ComponentFixture<ConnectLinkViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectLinkViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectLinkViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
