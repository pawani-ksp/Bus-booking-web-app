import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';

interface TurnData {
  id: string | number;
  busNumber?: string;
  route?: string;
  passengerCount: number;
}

@Component({
  selector: 'app-driver-dashboard',
  imports: [RouterLink],
  templateUrl: './driver-dashboard.html',
  styleUrl: './driver-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverDashboard implements OnInit, OnDestroy {
  currentTurn: TurnData = {
    id: 'N/A',
    busNumber: '—',
    route: '—',
    passengerCount: 0
  };

  private es?: EventSource;
  private pollTimer: ReturnType<typeof setInterval> | undefined;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Prefer Server-Sent Events for live updates
    try {
      this.es = new EventSource('/api/driver/turn/stream');
      this.es.onmessage = (e) => {
        try {
          this.currentTurn = JSON.parse(e.data) as TurnData;
          this.cdr.markForCheck();
        } catch {
          // ignore parse errors
        }
      };
      this.es.onerror = () => {
        this.es?.close();
        this.startPolling();
      };
    } catch {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.es?.close();
    if (this.pollTimer !== undefined) clearInterval(this.pollTimer);
  }

  private startPolling(): void {
    this.fetchCurrentTurn();
    this.pollTimer = setInterval(() => this.fetchCurrentTurn(), 5000);
  }

  private async fetchCurrentTurn(): Promise<void> {
    try {
      const res = await fetch('/api/driver/current-turn');
      if (!res.ok) return;
      this.currentTurn = await res.json();
      this.cdr.markForCheck();
    } catch {
      // ignore network errors
    }
  }
}
