import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type BusPanel = 'seats' | 'route';

interface BusListing {
  id: number;
  name: string;
  number: string;
  type: string;
  route: string;
  tripDate: string;
  departureTime: string;
  arrivalTime: string;
  ticketPrice: string;
  availableSeats: number;
  rating: number;
  seatMap: string[];
  routeStops: string[];
}

@Component({
  selector: 'app-bus-list',
  templateUrl: './bus-list.html',
  styleUrl: './bus-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusList {
  readonly buses: BusListing[] = [
    {
      id: 1,
      name: 'Weerawarna Express',
      number: 'WB-1024',
      type: 'Luxury AC Coach',
      route: 'Colombo to Kandy',
      tripDate: '2026-06-10',
      departureTime: '06:30 AM',
      arrivalTime: '09:15 AM',
      ticketPrice: 'LKR 1,250',
      availableSeats: 14,
      rating: 4.8,
      seatMap: ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B'],
      routeStops: ['Colombo Fort', 'Kadawatha', 'Pilimatalawa', 'Kandy Clock Tower']
    },
    {
      id: 2,
      name: 'Intercity Star',
      number: 'IS-7781',
      type: 'Semi Luxury',
      route: 'Galle to Colombo',
      tripDate: '2026-06-11',
      departureTime: '07:00 AM',
      arrivalTime: '09:45 AM',
      ticketPrice: 'LKR 980',
      availableSeats: 9,
      rating: 4.5,
      seatMap: ['1A', '1C', '2A', '2C', '3A', '3C', '4A', '4C', '5A'],
      routeStops: ['Galle', 'Ambalangoda', 'Kalutara', 'Colombo Pettah']
    },
    {
      id: 3,
      name: 'City Shuttle',
      number: 'CS-4412',
      type: 'Standard Express',
      route: 'Negombo to Colombo',
      tripDate: '2026-06-12',
      departureTime: '08:20 AM',
      arrivalTime: '09:10 AM',
      ticketPrice: 'LKR 650',
      availableSeats: 22,
      rating: 4.2,
      seatMap: ['2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'],
      routeStops: ['Negombo Bus Stand', 'Katunayake', 'Ja-Ela', 'Colombo Central']
    }
  ];

  readonly activeBusId = signal(this.buses[0]?.id ?? 0);
  readonly activePanel = signal<BusPanel>('seats');

  readonly activeBus = computed(() =>
    this.buses.find((bus) => bus.id === this.activeBusId()) ?? this.buses[0]
  );

  showSeats(busId: number): void {
    this.activeBusId.set(busId);
    this.activePanel.set('seats');
  }

  showRoute(busId: number): void {
    this.activeBusId.set(busId);
    this.activePanel.set('route');
  }
}