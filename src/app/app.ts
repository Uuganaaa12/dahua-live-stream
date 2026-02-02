import { Component, signal, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Camera {
  id: number;
  name: string;
  ip: string;
  user: string;
  pass: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnDestroy {

  protected readonly cameras = signal<Camera[]>([
    { id: 1, name: 'Camera 1', ip: '192.168.1.200', user: 'admin', pass: 'admin123' },
    { id: 2, name: 'Camera 2', ip: '192.168.1.201', user: 'admin', pass: 'admin123' },
  ]);

  protected readonly selectedCamera = signal<Camera | null>(null);

  private streamUrls = new Map<number, string>();
  private readers = new Map<number, ReadableStreamDefaultReader>();

  constructor(private sanitizer: DomSanitizer) {
    this.initializeStreams();
  }

  private async initializeStreams() {
    for (const cam of this.cameras()) {
      await this.createStream(cam);
    }
  }

  private async createStream(camera: Camera): Promise<void> {
    try {
      const url = `http://${camera.ip}/cgi-bin/mjpg/video.cgi?channel=1&subtype=0`;

      const response = await fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${camera.user}:${camera.pass}`)
        }
      });

      if (!response.ok) {
        console.error(`Camera ${camera.name} failed to connect`);
        return;
      }

      // MJPEG stream-г ReadableStream-р унших
      const reader = response.body?.getReader();
      if (!reader) return;

      this.readers.set(camera.id, reader);

      // Stream-г MediaSource API ашиглан процесс хийх
      const mediaSource = new MediaSource();
      const streamUrl = URL.createObjectURL(mediaSource);
      this.streamUrls.set(camera.id, streamUrl);

      // Trigger change detection
      this.cameras.set([...this.cameras()]);

    } catch (error) {
      console.error(`Error loading camera ${camera.name}:`, error);
    }
  }

  protected getStreamUrl(camera: Camera): SafeResourceUrl {
    const url = `http://${camera.user}:${camera.pass}@${camera.ip}/cgi-bin/mjpg/video.cgi?channel=1&subtype=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected getStreamUrlDirect(camera: Camera): string {
    return `http://${camera.user}:${camera.pass}@${camera.ip}/cgi-bin/mjpg/video.cgi?channel=1&subtype=0`;
  }

  protected open(camera: Camera) {
    this.selectedCamera.set(camera);
  }

  protected close() {
    this.selectedCamera.set(null);
  }

  protected onImageError(event: Event, camera: Camera) {
    console.error(`Failed to load stream for ${camera.name}`);
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';

    // Retry after 3 seconds
    setTimeout(() => {
      img.style.display = 'block';
      img.src = this.getStreamUrlDirect(camera);
    }, 3000);
  }

  ngOnDestroy() {
    // Cleanup
    this.streamUrls.forEach(url => URL.revokeObjectURL(url));
    this.readers.forEach(reader => reader.cancel());
  }
}
