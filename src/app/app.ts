import { Component, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Camera {
  id: number;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {


  protected readonly cameras = signal<Camera[]>([
    { id: 1, name: 'Camera 1' },
    { id: 2, name: 'Camera 2' },
    { id: 3, name: 'Camera 3' },
  ]);

  protected readonly selectedCamera = signal<Camera | null>(null);

  constructor(private sanitizer: DomSanitizer) {}


  protected getStreamUrl(cam: Camera): SafeResourceUrl {
    const url = `https://dahua-server.onrender.com/api/cameras/${cam.id}/stream`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected open(cam: Camera) {
    this.selectedCamera.set(cam);
  }

  protected close() {
    this.selectedCamera.set(null);
  }
}
