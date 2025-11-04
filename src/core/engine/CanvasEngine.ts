import type { Layer as KonvaLayer } from 'konva/lib/Layer'
import type { Stage } from 'konva/lib/Stage'
import type { EventBus } from './EventBus'

export interface CanvasEngineConfig {
  container: HTMLDivElement
  width: number
  height: number
}

/**
 * CanvasEngine - Konva 기반 캔버스 렌더링 엔진
 * 뷰포트 관리, 이벤트 처리, 렌더링을 담당
 */
export class CanvasEngine {
  private stage: Stage | null = null
  private mainLayer: KonvaLayer | null = null
  private events: EventBus
  private config: CanvasEngineConfig

  constructor(config: CanvasEngineConfig, events: EventBus) {
    this.config = config
    this.events = events
  }

  /**
   * 엔진 초기화
   */
  async initialize(): Promise<void> {
    // Konva를 동적으로 import
    const { default: Konva } = await import('konva')

    // Stage 생성
    this.stage = new Konva.Stage({
      container: this.config.container,
      width: this.config.width,
      height: this.config.height,
    })

    // 메인 레이어 생성
    this.mainLayer = new Konva.Layer()
    this.stage.add(this.mainLayer)

    // 이벤트 바인딩
    this.bindEvents()

    // 초기화 완료 이벤트
    this.events.emit('canvas:initialized')
  }

  /**
   * 이벤트 바인딩
   */
  private bindEvents(): void {
    if (!this.stage) return

    // 포인터 이벤트
    this.stage.on('pointerdown', (e) => {
      this.events.emit('canvas:pointer:down', {
        x: e.evt.clientX,
        y: e.evt.clientY,
        button: e.evt.button,
        target: e.target,
      })
    })

    this.stage.on('pointermove', (e) => {
      this.events.emit('canvas:pointer:move', {
        x: e.evt.clientX,
        y: e.evt.clientY,
        target: e.target,
      })
    })

    this.stage.on('pointerup', (e) => {
      this.events.emit('canvas:pointer:up', {
        x: e.evt.clientX,
        y: e.evt.clientY,
        button: e.evt.button,
        target: e.target,
      })
    })

    // 휠 이벤트 (줌)
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault()
      this.events.emit('canvas:wheel', {
        deltaX: e.evt.deltaX,
        deltaY: e.evt.deltaY,
        x: e.evt.clientX,
        y: e.evt.clientY,
      })
    })
  }

  /**
   * Stage 가져오기
   */
  getStage(): Stage | null {
    return this.stage
  }

  /**
   * 메인 레이어 가져오기
   */
  getMainLayer(): KonvaLayer | null {
    return this.mainLayer
  }

  /**
   * 리사이즈
   */
  resize(width: number, height: number): void {
    if (this.stage) {
      this.stage.width(width)
      this.stage.height(height)
      this.events.emit('canvas:resize', { width, height })
    }
  }

  /**
   * 화면 초기화
   */
  clear(): void {
    if (this.mainLayer) {
      this.mainLayer.destroyChildren()
      this.mainLayer.batchDraw()
      this.events.emit('canvas:cleared')
    }
  }

  /**
   * 엔진 정리
   */
  cleanup(): void {
    if (this.stage) {
      this.stage.destroy()
      this.stage = null
      this.mainLayer = null
      this.events.emit('canvas:destroyed')
    }
  }
}
