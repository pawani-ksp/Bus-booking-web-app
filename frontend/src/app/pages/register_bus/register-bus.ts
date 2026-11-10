import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-bus',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-bus.html',
  styleUrl: './register-bus.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterBus {
  private readonly fb = new FormBuilder();

  protected readonly successMsg = signal('');
  protected readonly errorMsg   = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly busForm = this.fb.nonNullable.group({
    busName: ['', [Validators.required, Validators.minLength(3)]],
    plateNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,3}-\d{4}$/)]],
    busType: ['Luxury AC Coach', Validators.required],
    route: ['', Validators.required],
    tripDate: ['2026-11-15', Validators.required],
    departureTime: ['06:30 AM', Validators.required],
    arrivalTime: ['09:30 AM', Validators.required],
    ticketPrice: ['LKR 1,200', Validators.required],
    totalSeats: [32, [Validators.required, Validators.min(10), Validators.max(60)]],
    driverName: ['', [Validators.required, Validators.minLength(3)]],
    driverPhone: ['', [Validators.required, Validators.minLength(8)]],
    driverLicense: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private auth: AuthService, private router: Router) {}

  async submitBus(): Promise<void> {
    this.busForm.markAllAsTouched();
    this.successMsg.set('');
    this.errorMsg.set('');

    if (this.busForm.invalid) {
      this.errorMsg.set('Please fill out all bus and driver details correctly (e.g. Plate format: WP-1234).');
      return;
    }

    this.isSubmitting.set(true);
    // Simulate / send to API
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.successMsg.set(
        `Bus "${this.busForm.value.busName}" (${this.busForm.value.plateNumber}) successfully registered and assigned to driver ${this.busForm.value.driverName}!`
      );
      setTimeout(() => {
        this.router.navigate(['/owner-dashboard']);
      }, 1500);
    }, 700);
  }
}

