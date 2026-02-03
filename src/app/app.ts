import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);

  protected readonly cameras = signal<Camera[]>([]);
  protected readonly selectedCamera = signal<Camera | null>(null);

  ngOnInit() {
    // JSON унших
    this.http.get<Camera[]>('cameras.json').subscribe({
      next: (data) => this.cameras.set(data),
      error: (err) => console.error('JSON Error:', err)
    });
  }

  // Angular-ийн аюулгүй байдлын алдааг (NG05604) засах функц
  protected getStreamUrl(ip: string): SafeUrl {
    const url = `http://${ip}/cgi-bin/mjpg/video.cgi`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  protected open(camera: Camera): void {
    this.selectedCamera.set(camera);
  }

  protected close(): void {
    this.selectedCamera.set(null);
  }
}
