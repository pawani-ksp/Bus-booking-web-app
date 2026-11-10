import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-rating',
  imports: [RouterLink],
  templateUrl: './bus-rating.html',
  styleUrl: './bus-rating.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusRating {
  readonly selectedBus = signal<string>('Weerawarna Express (WB-1024)');
  readonly ratingScore = signal<number>(5);
  readonly hoverScore = signal<number>(0);
  readonly reviewComment = signal<string>('');
  readonly isSubmitted = signal<boolean>(false);

  readonly tags = signal<Array<{ label: string; active: boolean }>>([
    { label: 'Clean & Comfortable Seats', active: true },
    { label: 'Punctual Departure', active: true },
    { label: 'Smooth Expressway Driving', active: false },
    { label: 'Working Air Conditioning', active: true },
    { label: 'Friendly Staff & Driver', active: false }
  ]);

  setRating(score: number): void {
    this.ratingScore.set(score);
  }

  setHover(score: number): void {
    this.hoverScore.set(score);
  }

  toggleTag(tagLabel: string): void {
    this.tags.update(items =>
      items.map(t => (t.label === tagLabel ? { ...t, active: !t.active } : t))
    );
  }

  submitRating(comment: string): void {
    this.reviewComment.set(comment);
    this.isSubmitted.set(true);
  }
}

