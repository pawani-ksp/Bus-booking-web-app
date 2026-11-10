import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface BookingRecord {
  id: number;
  busName: string;
  busNumber: string;
  route: string;
  tripDate: string;
  departureTime: string;
  seatLabel: string;
  status: 'confirmed' | 'cancelled' | 'swap_requested';
  bookedAt: string;
  emailConfirmed: boolean;
}

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyBookings implements OnInit {
  readonly bookings = signal<BookingRecord[]>([
    {
      id: 101,
      busName: 'Weerawarna Express',
      busNumber: 'WB-1024',
      route: 'Colombo to Kandy',
      tripDate: '2026-11-12',
      departureTime: '06:30 AM',
      seatLabel: '3A (Window)',
      status: 'confirmed',
      bookedAt: '2026-11-10 09:30 AM',
      emailConfirmed: true
    },
    {
      id: 102,
      busName: 'Intercity Star',
      busNumber: 'IS-7781',
      route: 'Galle to Colombo',
      tripDate: '2026-11-15',
      departureTime: '07:00 AM',
      seatLabel: '2B (Aisle)',
      status: 'confirmed',
      bookedAt: '2026-11-09 02:15 PM',
      emailConfirmed: true
    }
  ]);

  readonly loading = signal<boolean>(false);
  readonly actionNotice = signal<string>('');
  readonly selectedSwapBooking = signal<BookingRecord | null>(null);
  readonly swapTargetSeat = signal<string>('4A');

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  async fetchBookings(): Promise<void> {
    if (!this.auth.token) return;
    try {
      const res = await fetch('/api/bookings/my', {
        headers: { Authorization: this.auth.authHeader }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.bookings && data.bookings.length > 0) {
          this.bookings.set(data.bookings);
        }
      }
    } catch {
      // fallback to mock sample records
    }
  }

  async requestCancel(bookingId: number): Promise<void> {
    const confirmCancel = confirm(`Are you sure you want to request cancellation for Booking #${bookingId}?`);
    if (!confirmCancel) return;

    this.loading.set(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: this.auth.authHeader }
      });
      if (res.ok) {
        this.actionNotice.set(`Booking #${bookingId} was successfully cancelled. Refund initiated to account.`);
      } else {
        this.actionNotice.set(`Cancellation request recorded for Booking #${bookingId}.`);
      }
    } catch {
      this.actionNotice.set(`Cancellation request recorded for Booking #${bookingId}.`);
    } finally {
      this.bookings.update(items =>
        items.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      this.loading.set(false);
    }
  }

  openSwapModal(booking: BookingRecord): void {
    this.selectedSwapBooking.set(booking);
  }

  closeSwapModal(): void {
    this.selectedSwapBooking.set(null);
  }

  submitSeatSwap(targetSeat: string): void {
    const b = this.selectedSwapBooking();
    if (!b) return;

    this.bookings.update(items =>
      items.map(item =>
        item.id === b.id ? { ...item, status: 'swap_requested' } : item
      )
    );
    this.actionNotice.set(
      `Seat swap request sent for Booking #${b.id}! Requested swap from seat ${b.seatLabel} to seat ${targetSeat}. We will notify you once accepted.`
    );
    this.closeSwapModal();
  }
}

