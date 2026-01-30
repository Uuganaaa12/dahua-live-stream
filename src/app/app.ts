import { Component, computed, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly localIp = signal('');

  private readonly streamUrlRaw = computed(() => {
    const ip = this.localIp().trim();
    if (!ip) {
      return null;
    }

    return `http://${ip}/cgi-bin/mjpg/video.cgi?channel=1&subtype=0`;
  });

  protected readonly streamUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.streamUrlRaw();
    if (!url) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  constructor(private readonly sanitizer: DomSanitizer) {}

  protected onIpChange(value: string): void {
    this.localIp.set(value.trim());
  }
}
