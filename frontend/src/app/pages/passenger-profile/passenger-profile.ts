import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-passenger-profile',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './passenger-profile.html',
  styleUrl: './passenger-profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PassengerProfile implements OnInit, OnDestroy {
  @ViewChild('cameraVideo') cameraVideoRef?: ElementRef<HTMLVideoElement>;

  private readonly fb = new FormBuilder();

  protected readonly photoPreview  = signal<string>('/images/logo.png');
  protected readonly savedMessage  = signal('');
  protected readonly errorMessage  = signal('');
  protected readonly loadingData   = signal(true);
  protected readonly savingData    = signal(false);
  protected readonly isCameraOpen  = signal(false);
  protected readonly cameraError   = signal('');

  private mediaStream: MediaStream | null = null;
  private objectUrl: string | null = null;

  protected readonly profileForm = this.fb.nonNullable.group({
    fullName:          ['', [Validators.required, Validators.minLength(3)]],
    email:             ['', [Validators.required, Validators.email]],
    phone:             ['', [Validators.required, Validators.minLength(8)]],
    nic:               ['', [Validators.required, Validators.minLength(8)]],
    address:           ['', [Validators.required, Validators.minLength(10)]],
    gender:            ['Male', Validators.required],
    city:              ['', Validators.required],
    preferredStation:  ['', Validators.required],
    emergencyContact:  ['', [Validators.required, Validators.minLength(8)]],
    bio:               ['']
  });

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    this.loadingData.set(true);
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: this.auth.authHeader }
      });
      if (!res.ok) return;
      const { user } = await res.json();

      const authUser = this.auth.user;
      this.profileForm.patchValue({
        fullName:         user.name        ?? authUser?.name ?? '',
        email:            user.email       ?? authUser?.email ?? '',
        phone:            user.phone       ?? '',
        nic:              user.nic         ?? '',
        address:          user.address     ?? '',
        gender:           user.gender      ?? 'Male',
        city:             user.city        ?? '',
        preferredStation: user.preferredStation  ?? '',
        emergencyContact: user.emergencyContact  ?? '',
        bio:              user.bio         ?? ''
      });
    } catch {
      // non-fatal
    } finally {
      this.loadingData.set(false);
    }
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = URL.createObjectURL(file);
    this.photoPreview.set(this.objectUrl);
    this.savedMessage.set('Photo uploaded from stored files.');
  }

  async startCamera(): Promise<void> {
    this.cameraError.set('');
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      });
      this.isCameraOpen.set(true);
      setTimeout(() => {
        if (this.cameraVideoRef && this.mediaStream) {
          this.cameraVideoRef.nativeElement.srcObject = this.mediaStream;
        }
      }, 50);
    } catch (err: any) {
      this.cameraError.set('Could not access camera: ' + (err.message || 'Permission denied'));
    }
  }

  captureCameraSnap(): void {
    if (!this.cameraVideoRef) return;
    const video = this.cameraVideoRef.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      this.photoPreview.set(dataUrl);
      this.savedMessage.set('Profile picture captured from camera!');
    }
    this.stopCamera();
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isCameraOpen.set(false);
  }

  async saveProfile(): Promise<void> {
    this.profileForm.markAllAsTouched();
    this.savedMessage.set('');
    this.errorMessage.set('');

    if (this.profileForm.invalid) {
      this.errorMessage.set('Please complete all required fields before saving.');
      return;
    }

    const v = this.profileForm.getRawValue();
    this.savingData.set(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.auth.authHeader
        },
        body: JSON.stringify({
          name:             v.fullName,
          phone:            v.phone,
          nic:              v.nic,
          address:          v.address,
          gender:           v.gender,
          city:             v.city,
          preferredStation: v.preferredStation,
          emergencyContact: v.emergencyContact,
          bio:              v.bio
        })
      });
      if (res.ok) {
        this.savedMessage.set('Profile saved successfully.');
      } else {
        const err = await res.json();
        this.errorMessage.set(err.message || 'Failed to save profile.');
      }
    } catch {
      this.errorMessage.set('Network error — please try again.');
    } finally {
      this.savingData.set(false);
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
}
