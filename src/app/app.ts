import { Component, signal } from '@angular/core';

interface Camera {
  id: number;
  ip: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly cameras = signal<Camera[]>([
    { id: 1, ip: '192.168.1.201' },
    { id: 2, ip: '192.168.1.200' },
  ]);

  protected readonly selectedCamera = signal<Camera | null>(null);

  protected getStreamUrl(ip: string): string {

    return `http://${ip}/cgi-bin/mjpg/video.cgi`;
  }

  protected open(camera: Camera) {
    this.selectedCamera.set(camera);
  }

  protected close() {
    this.selectedCamera.set(null);
  }
}
