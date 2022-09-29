import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  convertToParamMap,
  Router,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { P2pJsonRpcService } from '../p2p-json-rpc.service';

import { ConnectLinkViewComponent } from './connect-link-view.component';

function getPropertyGetSpy<T, K extends keyof T>(x: T, prop: K) {
  return Object.getOwnPropertyDescriptor(x, prop)?.get as jasmine.Spy<
    (this: T) => T[K]
  >;
}

describe('ConnectLinkViewComponent', () => {
  let p2pJsonRpcServiceMock: jasmine.SpyObj<P2pJsonRpcService>;
  let routeMock: jasmine.SpyObj<ActivatedRoute>;
  let routerMock: jasmine.SpyObj<Router>;
  let component: ConnectLinkViewComponent;
  let fixture: ComponentFixture<ConnectLinkViewComponent>;

  beforeEach(async () => {
    p2pJsonRpcServiceMock = jasmine.createSpyObj('P2pJsonRpcService', [
      'connect',
    ]);
    routeMock = jasmine.createSpyObj('ActivatedRoute', [], ['snapshot']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: P2pJsonRpcService,
          useValue: p2pJsonRpcServiceMock,
        },
        {
          provide: ActivatedRoute,
          useValue: routeMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
      ],
      declarations: [ConnectLinkViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectLinkViewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should connect using p2pJsonRpcService', async () => {
    getPropertyGetSpy(routeMock, 'snapshot').and.returnValue({
      paramMap: convertToParamMap({
        peerId: '3131b90c-811e-4326-97c3-a4264195e26a',
      }),
    } as ActivatedRouteSnapshot);
    const connectSpy = p2pJsonRpcServiceMock.connect.and.resolveTo(undefined);
    const navigateSpy = routerMock.navigate.and.resolveTo(true);

    await component.ngOnInit();

    expect(connectSpy).toHaveBeenCalledOnceWith(
      '3131b90c-811e-4326-97c3-a4264195e26a'
    );
    expect(navigateSpy).toHaveBeenCalledOnceWith(['/']);
  });
});
