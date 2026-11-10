import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Station {
  id: number;
  name: string;
  city: string;
  lat: number;
  lng: number;
  busesCount: number;
  buses: Array<{
    id: number;
    name: string;
    route: string;
    departure: string;
    seatsLeft: number;
    price: string;
  }>;
}

@Component({
  selector: 'app-bus-station-map',
  imports: [RouterLink],
  templateUrl: './bus-station-map.html',
  styleUrl: './bus-station-map.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusStationMap {
  readonly stations = signal<Station[]>([
    {
      id: 1,
      name: 'Colombo Central Bus Stand',
      city: 'Colombo',
      lat: 6.9344,
      lng: 79.8533,
      busesCount: 12,
      buses: [
        { id: 1, name: 'Weerawarna Express', route: 'Colombo -> Kandy', departure: '06:30 AM', seatsLeft: 14, price: 'LKR 1,250' },
        { id: 4, name: 'Southern Star Express', route: 'Colombo -> Galle', departure: '08:00 AM', seatsLeft: 8, price: 'LKR 950' },
        { id: 5, name: 'Highland Luxury Coach', route: 'Colombo -> Nuwara Eliya', departure: '09:15 AM', seatsLeft: 5, price: 'LKR 1,800' }
      ]
    },
    {
      id: 2,
      name: 'Kandy Goodshed Bus Stand',
      city: 'Kandy',
      lat: 7.2906,
      lng: 80.6337,
      busesCount: 8,
      buses: [
        { id: 6, name: 'Central Link Super', route: 'Kandy -> Colombo', departure: '07:30 AM', seatsLeft: 11, price: 'LKR 1,250' },
        { id: 7, name: 'Hill Express', route: 'Kandy -> Kurunegala', departure: '10:00 AM', seatsLeft: 18, price: 'LKR 600' }
      ]
    },
    {
      id: 3,
      name: 'Galle Central Bus Station',
      city: 'Galle',
      lat: 6.0367,
      lng: 80.2170,
      busesCount: 6,
      buses: [
        { id: 2, name: 'Intercity Star', route: 'Galle -> Colombo (Highway)', departure: '07:00 AM', seatsLeft: 9, price: 'LKR 980' },
        { id: 8, name: 'Ruhunu Express', route: 'Galle -> Matara', departure: '09:00 AM', seatsLeft: 15, price: 'LKR 450' }
      ]
    },
    {
      id: 4,
      name: 'Negombo Main Bus Stand',
      city: 'Negombo',
      lat: 7.2088,
      lng: 79.8358,
      busesCount: 7,
      buses: [
        { id: 3, name: 'City Shuttle', route: 'Negombo -> Colombo Central', departure: '08:20 AM', seatsLeft: 22, price: 'LKR 650' }
      ]
    }
  ]);

  readonly selectedStationId = signal<number>(1);
  readonly userGpsLocation = signal<{ lat: number; lng: number } | null>({ lat: 6.9271, lng: 79.8612 });
  readonly gpsStatus = signal<string>('GPS active — Simulated near Colombo');

  readonly selectedStation = computed(() => {
    return this.stations().find(s => s.id === this.selectedStationId()) ?? this.stations()[0];
  });

  selectStation(id: number): void {
    this.selectedStationId.set(id);
  }

  detectLiveLocation(): void {
    if ('geolocation' in navigator) {
      this.gpsStatus.set('Locating your GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userGpsLocation.set({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4))
          });
          this.gpsStatus.set(`Live GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          this.gpsStatus.set('Location permission denied — showing default GPS');
        }
      );
    } else {
      this.gpsStatus.set('Geolocation is not supported by your browser');
    }
  }
}

