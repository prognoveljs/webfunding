import { fund } from "./fund";

class WebMonetization {
  public currentPool: WMPointer[] = [];

  constructor(opts?: any) {}

  set(pointers: WMPointer | WMPointer[]): void {
    this.currentPool = Array.isArray(pointers) ? pointers : [pointers];
  }

  add(pointers: WMPointer | WMPointer[]): void {
    if (!Array.isArray(pointers)) pointers = [pointers];
    this.currentPool = [...this.currentPool, ...pointers];
  }

  addAffiliateReferrer(pointers: WMPointer) {}

  start(): void {
    try {
      fund(this.currentPool);
    } catch (error) {
      console.warn(error);
    }
  }

  reset(): void {
    this.start();
  }
}
