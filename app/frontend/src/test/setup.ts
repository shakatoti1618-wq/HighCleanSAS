import '@testing-library/jest-dom/vitest'

class IntersectionObserverMock {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = []

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver =
  globalThis.IntersectionObserver ?? (IntersectionObserverMock as unknown as typeof IntersectionObserver)

class CanvasRenderingContext2DMock {
  clearRect(): void {}
  beginPath(): void {}
  arc(): void {}
  stroke(): void {}
  fill(): void {}
  moveTo(): void {}
  lineTo(): void {}
}

if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: () => new CanvasRenderingContext2DMock(),
    writable: true,
  })
}