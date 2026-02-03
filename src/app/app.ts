import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Camera {
  id: number;
  ip: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private http = inject(HttpClient);
  protected readonly cameras = signal<Camera[]>([]);
  protected readonly selectedCamera = signal<Camera | null>(null);

  ngOnInit() {
    this.http.get<Camera[]>('/assets/cameras.json').subscribe(data => {
      this.cameras.set(data);
    });
  }

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
