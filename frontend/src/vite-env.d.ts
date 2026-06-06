/// <reference types="vite/client" />

interface Window {
  bootstrap?: {
    Modal: {
      new (el: Element | string): { show: () => void; hide: () => void }
      getInstance(el: Element | string): { show: () => void; hide: () => void } | null
    }
  }
  Chart?: new (ctx: CanvasRenderingContext2D, config: object) => { destroy?: () => void }
}
