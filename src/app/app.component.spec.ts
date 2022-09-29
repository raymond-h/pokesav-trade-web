import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { P2pJsonRpcService } from './p2p-json-rpc.service';

describe('AppComponent', () => {
  let p2pJsonRpcService: jasmine.SpyObj<P2pJsonRpcService>;

  beforeEach(async () => {
    p2pJsonRpcService = jasmine.createSpyObj<P2pJsonRpcService>(
      'P2pJsonRpcService',
      ['initialize']
    );

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: P2pJsonRpcService,
          useValue: p2pJsonRpcService,
        },
      ],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.container h1')?.textContent).toContain(
      'Pokesav Trade'
    );
  });

  it('should initialize P2pJsonRpcService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(p2pJsonRpcService.initialize).toHaveBeenCalledOnceWith();
  });
});
