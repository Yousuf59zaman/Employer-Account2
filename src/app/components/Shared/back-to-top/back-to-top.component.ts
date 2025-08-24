import { Component, HostListener, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './back-to-top.component.html',
  styleUrl: './back-to-top.component.scss'
})
export class BackToTopComponent {
  showBackToTop: boolean = false;
  @Input() target: string | HTMLElement | null = null;
  @Input() position: 'fixed' | 'absolute' | 'sticky' = 'fixed';
  @Input() threshold: number = 150;
  @Input() alignWithScrollbar: boolean = false;
  @Input() rightOffset: number = 0;
  @Input() bottomOffset: number | null = null;

  computedRightOffset: number = 0;
  computedBottomOffset: number = 12;

  private scrollTargetEl: HTMLElement | null = null;
  private boundScrollHandler = () => this.updateVisibility();

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.scrollTargetEl) {
      this.showBackToTop = window.scrollY > this.threshold;
    }
  }

  ngAfterViewInit(): void {
    if (typeof this.target === 'string' && this.target) {
      this.scrollTargetEl = document.getElementById(this.target) as HTMLElement | null;
    } else if (this.target instanceof HTMLElement) {
      this.scrollTargetEl = this.target;
    }

    if (this.scrollTargetEl) {
      this.scrollTargetEl.addEventListener('scroll', this.boundScrollHandler, { passive: true });
      this.updateVisibility();
      this.computeOffsets();
    } else {
      this.updateVisibility();
      this.computeOffsets();
    }
  }

  ngOnDestroy(): void {
    if (this.scrollTargetEl) {
      this.scrollTargetEl.removeEventListener('scroll', this.boundScrollHandler);
    }
  }

  private updateVisibility(): void {
    if (this.scrollTargetEl) {
      this.showBackToTop = this.scrollTargetEl.scrollTop > this.threshold;
    } else {
      this.showBackToTop = window.scrollY > this.threshold;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.computeOffsets();
  }

  private computeOffsets(): void {
    this.computeRightOffset();
    this.computeBottomOffset();
  }

  private computeRightOffset(): void {
    if (this.alignWithScrollbar && this.scrollTargetEl) {
      const scrollbarWidth = this.scrollTargetEl.offsetWidth - this.scrollTargetEl.clientWidth;
      const gap = 2; 
      this.computedRightOffset = Math.max(0, scrollbarWidth + gap + this.rightOffset);
    } else {
      this.computedRightOffset = 12 + this.rightOffset;
    }
  }

  private computeBottomOffset(): void {
    const defaultGap = 8;
    if (this.position === 'absolute') {
      this.computedBottomOffset = this.bottomOffset ?? defaultGap;
      return;
    }

    if (this.scrollTargetEl) {
      const rect = this.scrollTargetEl.getBoundingClientRect();
      const distanceFromViewportBottom = Math.max(0, window.innerHeight - rect.bottom);
      const base = distanceFromViewportBottom + defaultGap;
      this.computedBottomOffset = (this.bottomOffset ?? base);
    } else {
      this.computedBottomOffset = this.bottomOffset ?? defaultGap;
    }
  }

  scrollToTop(): void {
    if (this.scrollTargetEl) {
      this.scrollTargetEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

}
