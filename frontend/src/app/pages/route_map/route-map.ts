import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

interface RouteStop {
  name: string;
  order: number;
  time: string;
  distance: string;
  isPassed: boolean;
  lat: number;
  lng: number;
}

interface BusRoute {
  id: number;
  name: string;
  number: string;
  origin: string;
  destination: string;
  duration: string;
  distanceTotal: string;
  currentStopIndex: number;
  stops: RouteStop[];
}

@Component({
  selector: 'app-route-map',
  imports: [RouterLink],
  templateUrl: './route-map.html',
  styleUrl: './route-map.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RouteMap {
  readonly routes = signal<BusRoute[]>([
    {
      id: 1,
      name: 'Weerawarna Express (AC Luxury)',
      number: 'WB-1024',
      origin: 'Colombo Fort',
      destination: 'Kandy Clock Tower',
      duration: '2h 45m',
      distanceTotal: '115 km',
      currentStopIndex: 1,
      stops: [
        { name: 'Colombo Fort Terminal', order: 1, time: '06:30 AM', distance: '0 km', isPassed: true, lat: 6.9344, lng: 79.8533 },
        { name: 'Kadawatha Expressway Interchange', order: 2, time: '07:05 AM', distance: '18 km', isPassed: true, lat: 7.0016, lng: 79.9542 },
        { name: 'Ambepussa Rest Stop', order: 3, time: '07:55 AM', distance: '58 km', isPassed: false, lat: 7.2458, lng: 80.2075 },
        { name: 'Peradeniya Junction', order: 4, time: '08:45 AM', distance: '109 km', isPassed: false, lat: 7.2589, lng: 80.5975 },
        { name: 'Kandy Clock Tower Terminal', order: 5, time: '09:15 AM', distance: '115 km', isPassed: false, lat: 7.2906, lng: 80.6337 }
      ]
    },
    {
      id: 2,
      name: 'Southern Highway Express',
      number: 'IS-7781',
      origin: 'Galle Central',
      destination: 'Colombo Pettah',
      duration: '1h 50m',
      distanceTotal: '119 km',
      currentStopIndex: 2,
      stops: [
        { name: 'Galle Central Terminal', order: 1, time: '07:00 AM', distance: '0 km', isPassed: true, lat: 6.0367, lng: 80.2170 },
        { name: 'Kurundugahahetekma Interchange', order: 2, time: '07:35 AM', distance: '40 km', isPassed: true, lat: 6.2755, lng: 80.1471 },
        { name: 'Dodangoda Interchange', order: 3, time: '08:10 AM', distance: '78 km', isPassed: false, lat: 6.6022, lng: 80.0528 },
        { name: 'Kottawa Multimodal Hub', order: 4, time: '08:40 AM', distance: '105 km', isPassed: false, lat: 6.8409, lng: 79.9654 },
        { name: 'Colombo Pettah Central', order: 5, time: '09:45 AM', distance: '119 km', isPassed: false, lat: 6.9344, lng: 79.8533 }
      ]
    }
  ]);

  readonly activeRouteId = signal<number>(1);

  readonly selectedRoute = computed(() => {
    return this.routes().find(r => r.id === this.activeRouteId()) ?? this.routes()[0];
  });

  selectRoute(id: number): void {
    this.activeRouteId.set(id);
  }
}

