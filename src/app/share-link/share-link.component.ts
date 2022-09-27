import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, map, merge, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-share-link',
  templateUrl: './share-link.component.html',
  styleUrls: ['./share-link.component.css'],
})
export class ShareLinkComponent implements OnInit, OnDestroy {
  @Input() link!: string;

  recentlyClicked = false;

  clickSubject = new Subject<void>();

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.subscriptions.push(
      merge(
        this.clickSubject.pipe(map(() => true)),
        this.clickSubject.pipe(
          debounceTime(2000),
          map(() => false)
        )
      ).subscribe((recentlyClicked) => (this.recentlyClicked = recentlyClicked))
    );
  }

  ngOnDestroy(): void {
    for (const s of this.subscriptions) {
      s.unsubscribe();
    }
  }

  async onClick() {
    await navigator.clipboard.writeText(this.link);
    this.clickSubject.next();
  }
}
