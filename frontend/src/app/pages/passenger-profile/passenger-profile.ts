import { ChangeDetectionStrategy, Component, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-passenger-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './passenger-profile.html',
  styleUrl: './passenger-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PassengerProfile implements OnDestroy {
  private readonly fb = new FormBuilder();

  protected readonly photoPreview = signal<string>('/images/logo.png');
  protected readonly savedMessage = signal('');

  protected readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    nic: ['', [Validators.required, Validators.minLength(8)]],
    address: ['', [Validators.required, Validators.minLength(10)]],
    gender: ['Male', Validators.required],
    city: ['', Validators.required],
    preferredStation: ['', Validators.required],
    emergencyContact: ['', [Validators.required, Validators.minLength(8)]],
    bio: ['']
  });

  private objectUrl: string | null = null;

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.objectUrl = URL.createObjectURL(file);
    this.photoPreview.set(this.objectUrl);
    this.savedMessage.set('');
  }

  saveProfile(): void {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.invalid) {
      this.savedMessage.set('Please complete all required fields before saving.');
      return;
    }

    this.savedMessage.set('Passenger profile saved successfully.');
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }
}