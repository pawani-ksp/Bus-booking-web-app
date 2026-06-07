import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-passenger-dashboard',
  imports: [RouterLink],
  templateUrl: './passenger-dashboard.html',
  styleUrl: './passenger-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PassengerDashboard {
  readonly quickActions = [
    {
      title: 'Find buses',
      description: 'See available buses at the station in map view.',
      link: '/bus-station-map'
    },
    {
      title: 'Book a seat',
      description: 'Select a bus, choose a seat, and confirm your booking.',
      link: '/seat-selection'
    },
    {
      title: 'My bookings',
      description: 'Review active bookings, cancellations, and seat swaps.',
      link: '/my-bookings'
    }
  ];

  readonly highlights = [
    'Live map view of nearby buses',
    'Fast seat booking workflow',
    'Booking confirmation by email'
  ];
}