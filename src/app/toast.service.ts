import { Injectable } from '@angular/core';

export interface ToastInfo {
  title: string;
  body: string;
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: ToastInfo[] = [];

  show(toastInfo: ToastInfo) {
    this.toasts.push(toastInfo);
  }

  remove(toastInfo: ToastInfo) {
    this.toasts = this.toasts.filter((t) => t !== toastInfo);
  }
}
