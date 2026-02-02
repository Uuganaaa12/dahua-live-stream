import { Component, computed, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Camera {
  id: number;
  name: string;
  ip: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly cameras = signal<Camera[]>([
    { id: 1, name: 'Camera 1', ip: '192.168.1.200', username: 'admin', password: 'admin123' },
    { id: 2, name: 'Camera 2', ip: '192.168.1.201', username: 'admin', password: 'admin123'  },
    { id: 3, name: 'Camera 3', ip: '192.168.1.202', username: 'admin', password: 'admin123' },
  ]);

  protected readonly selectedCamera = signal<Camera | null>(null);

  constructor(private readonly sanitizer: DomSanitizer) {}

  protected getStreamUrl(ip: string): SafeResourceUrl {
    const camera = this.cameras().find((camera) => camera.ip === ip);
    if (!camera) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    const { username, password } = camera;
    const url = `http://${username}:${password}@${ip}/cgi-bin/mjpg/video.cgi?channel=1&subtype=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected open(camera: Camera) {
    this.selectedCamera.set(camera);
  }

  protected close() {
    this.selectedCamera.set(null);
  }
}
