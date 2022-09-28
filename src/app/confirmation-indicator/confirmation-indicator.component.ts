import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-confirmation-indicator',
  templateUrl: './confirmation-indicator.component.html',
  styleUrls: ['./confirmation-indicator.component.css'],
})
export class ConfirmationIndicatorComponent {
  @Input() confirmed!: boolean;
}
