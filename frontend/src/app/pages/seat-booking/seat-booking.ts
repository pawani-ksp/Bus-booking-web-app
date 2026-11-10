import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Seat {
  id: number;
  label: string;
  isAvailable: boolean;
}

interface BusOption {
  id: number;
  name: string;
  number: string;
  route: string;
  tripDate: string;
  departureTime: string;
  arrivalTime: string;
  ticketPrice: string;
  rating: number;
}

type BookingStep = 'select-bus' | 'select-seat' | 'confirm' | 'done';

@Component({
  selector: 'app-seat-booking',
  imports: [RouterLink],
  templateUrl: './seat-booking.html',
  styleUrl: './seat-booking.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatBooking implements OnInit {
  readonly step         = signal<BookingStep>('select-bus');
  readonly buses        = signal<BusOption[]>([]);
  readonly seats        = signal<Seat[]>([]);
  readonly selectedBus  = signal<BusOption | null>(null);
  readonly selectedSeat = signal<Seat | null>(null);
  readonly loading      = signal(false);
  readonly error        = signal('');
  readonly bookingId    = signal<number | null>(null);

  readonly availableSeats = computed(() => this.seats().filter(s => s.isAvailable));
  readonly takenSeats     = computed(() => this.seats().filter(s => !s.isAvailable));

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loadBuses();
  }

  private async loadBuses(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await fetch('/api/buses');
      if (!res.ok) throw new Error('Failed to load buses');
      const data = await res.json();
      this.buses.set(data.buses ?? []);
    } catch {
      this.error.set('Could not load buses. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async chooseBus(bus: BusOption): Promise<void> {
    this.selectedBus.set(bus);
    this.selectedSeat.set(null);
    this.seats.set([]);
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await fetch(`/api/buses/${bus.id}/seats`);
      if (!res.ok) throw new Error('Failed to load seats');
      const data = await res.json();
      this.seats.set(data.seats ?? []);
      this.step.set('select-seat');
    } catch {
      this.error.set('Could not load seats. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  chooseSeat(seat: Seat): void {
    if (!seat.isAvailable) return;
    this.selectedSeat.set(seat);
    this.step.set('confirm');
  }

  goBack(): void {
    const current = this.step();
    if (current === 'select-seat') this.step.set('select-bus');
    else if (current === 'confirm') this.step.set('select-seat');
  }

  async confirmBooking(): Promise<void> {
    const bus  = this.selectedBus();
    const seat = this.selectedSeat();
    if (!bus || !seat) return;

    this.loading.set(true);
    this.error.set('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.auth.authHeader
        },
        body: JSON.stringify({ busId: bus.id, seatId: seat.id })
      });
      if (!res.ok) {
        const err = await res.json();
        this.error.set(err.message || 'Booking failed');
        return;
      }
      const data = await res.json();
      this.bookingId.set(data.bookingId);
      this.step.set('done');
    } catch {
      this.error.set('Network error — please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  startOver(): void {
    this.step.set('select-bus');
    this.selectedBus.set(null);
    this.selectedSeat.set(null);
    this.bookingId.set(null);
    this.error.set('');
    this.loadBuses();
  }
}
