import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.html',
  styleUrl: './driver-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverDashboard implements OnInit, OnDestroy {
  currentTurn = {
    id: 'N/A',
    passengerCount: 0
  };

  private es?: EventSource;
  private pollTimer: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Prefer Server-Sent Events for live updates
    try {
      this.es = new EventSource('/api/driver/turn/stream');
      this.es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          this.currentTurn = data;
          this.cdr.markForCheck();
        } catch {
          // ignore parse errors
        }
      };

      this.es.onerror = () => {
        // SSE failed; fall back to polling
        this.es?.close();
        this.startPolling();
      };
    } catch {
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    if (this.es) {
      this.es.close();
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  private startPolling(): void {
    // initial fetch
    this.fetchCurrentTurn();
    this.pollTimer = setInterval(() => this.fetchCurrentTurn(), 5000);
  }

  private async fetchCurrentTurn(): Promise<void> {
    try {
      const res = await fetch('/api/driver/current-turn');
      if (!res.ok) return;
      const data = await res.json();
      this.currentTurn = data;
      this.cdr.markForCheck();
    } catch {
      // ignore network errors
    }
  }
}
