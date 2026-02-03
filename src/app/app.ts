import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Camera {
  id: number;
  ip: string;
  name?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  protected readonly cameras = signal<Camera[]>([]);
  protected readonly selectedCamera = signal<Camera | null>(null);

  ngOnInit() {
    this.http.get<Camera[]>('cameras.json').subscribe({
      next: (data) => this.cameras.set(data),
      error: (err) => console.error('JSON Error:', err)
    });
  }

  // URL-ийг "итгэмжлэгдсэн" болгож хувиргах
  protected getStreamUrl(ip: string): SafeUrl {
    const url = `http://${ip}/cgi-bin/mjpg/video.cgi`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  // Modal нээх функц
  protected open(camera: Camera): void {
    this.selectedCamera.set(camera);
  }

  // Modal хаах функц
  protected close(): void {
    this.selectedCamera.set(null);
  }
}
