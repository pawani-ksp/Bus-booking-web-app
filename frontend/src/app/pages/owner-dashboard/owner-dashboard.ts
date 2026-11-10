import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface BusRow {
  id: number;
  name: string;
  number: string;
  type: string;
  route: string;
  tripDate: string;
  departureTime: string;
  arrivalTime: string;
  ticketPrice: string;
  rating: number;
}

interface DriverRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  assignedBus: string;
}

@Component({
  selector: 'app-owner-dashboard',
  imports: [RouterLink],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnerDashboard implements OnInit {
  readonly buses   = signal<BusRow[]>([]);
  readonly drivers = signal<DriverRow[]>([]);
  readonly loading = signal(true);
  readonly error   = signal('');

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      const headers = { Authorization: this.auth.authHeader };

      const [busRes, driverRes] = await Promise.all([
        fetch('/api/owner/buses',   { headers }),
        fetch('/api/owner/drivers', { headers })
      ]);

      if (busRes.ok) {
        const data = await busRes.json();
        this.buses.set(data.buses ?? []);
      }

      if (driverRes.ok) {
        const data = await driverRes.json();
        this.drivers.set(data.drivers ?? []);
      }
    } catch {
      this.error.set('Failed to load dashboard data. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
