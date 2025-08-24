import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[portalToBody]',
  standalone: true
})
export class PortalToBodyDirective implements OnInit, OnDestroy {
  private originalParent: Node | null = null;
  private nextSibling: Node | null = null;
  private movedToBody: boolean = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;
    this.originalParent = element.parentNode;
    this.nextSibling = element.nextSibling;
    document.body.appendChild(element);
    this.movedToBody = true;
  }

  ngOnDestroy(): void {
    if (!this.movedToBody) return;
    const element = this.elementRef.nativeElement;
    if (this.originalParent) {
      if (this.nextSibling && this.originalParent.contains(this.nextSibling)) {
        this.originalParent.insertBefore(element, this.nextSibling);
      } else {
        this.originalParent.appendChild(element);
      }
    } else {
      element.remove();
    }
  }
}


