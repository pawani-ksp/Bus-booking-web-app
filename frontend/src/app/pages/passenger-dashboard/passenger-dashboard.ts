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
      title: 'Find Buses (Station Map)',
      description: 'See available buses at the station in interactive radar map view.',
      link: '/bus-station-map'
    },
    {
      title: 'Book a Seat',
      description: 'Select a bus, choose an interactive seat, and confirm your booking.',
      link: '/seat-booking'
    },
    {
      title: 'My Bookings & Seat Swap',
      description: 'Review active bookings, cancel tickets, and request seat swaps.',
      link: '/my-bookings'
    },
    {
      title: 'Route Map & GPS',
      description: 'Track expressways, waypoint stops, and live bus position.',
      link: '/route-map'
    },
    {
      title: 'Rate & Review Buses',
      description: 'Give feedback, star ratings, and punctuality reviews.',
      link: '/bus-rating'
    },
    {
      title: 'Passenger Profile',
      description: 'Update your camera photo, contact info, and preferred station.',
      link: '/passenger-profile'
    }
  ];

  readonly highlights = [
    'Live map view of nearby station buses',
    'Interactive 4-step seat reservation',
    'Seat swap request between passengers',
    'Live waypoint timeline & GPS radar',
    'Instant cancellation with automated status'
  ];
}
