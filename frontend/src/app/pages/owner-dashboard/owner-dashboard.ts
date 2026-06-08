import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-owner-dashboard',
  imports: [RouterLink],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnerDashboard {
  readonly buses = [] as Array<any>;
  readonly drivers = [] as Array<any>;
}
