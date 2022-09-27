import { Component, OnInit } from '@angular/core';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-toast-global',
  templateUrl: './toast-global.component.html',
  styleUrls: ['./toast-global.component.css'],
})
export class ToastGlobalComponent {
  constructor(public toastService: ToastService) {}
}
