type EventHandler<T = unknown> = (data: T) => void

/**
 * EventBus - 플러그인 간 통신의 핵심
 * 완전한 디커플링을 위한 이벤트 기반 아키텍처
 */
export class EventBus {
  private listeners = new Map<string, Set<EventHandler>>()
  private debugMode = false

  /**
   * 이벤트 구독
   */
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(handler as EventHandler)

    if (this.debugMode) {
      // console.log(`[EventBus] Subscribed to: ${event}`)
    }

    // 구독 해제 함수 반환
    return () => this.off(event, handler)
  }

  /**
   * 이벤트 발행
   */
  emit<T = unknown>(event: string, data?: T): void {
    const handlers = this.listeners.get(event)

    if (this.debugMode) {
      // console.log(`[EventBus] Emitting: ${event}`, data)
    }

    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data)
        } catch (error) {
          console.error(`[EventBus] Error in handler for ${event}:`, error)
        }
      }
    }
  }

  /**
   * 이벤트 구독 해제
   */
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler as EventHandler)

    if (this.debugMode) {
      // console.log(`[EventBus] Unsubscribed from: ${event}`)
    }
  }

  /**
   * 한 번만 실행되는 이벤트 구독
   */
  once<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (data: T) => {
      handler(data)
      this.off(event, wrappedHandler)
    }

    return this.on(event, wrappedHandler)
  }

  /**
   * 모든 리스너 제거
   */
  clear(): void {
    this.listeners.clear()

    if (this.debugMode) {
      console.log('[EventBus] All listeners cleared')
    }
  }

  /**
   * 특정 이벤트의 모든 리스너 제거
   */
  clearEvent(event: string): void {
    this.listeners.delete(event)

    if (this.debugMode) {
      console.log(`[EventBus] Cleared all listeners for: ${event}`)
    }
  }

  /**
   * 디버그 모드 설정
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }

  /**
   * 이벤트 통계
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    this.listeners.forEach((handlers, event) => {
      stats[event] = handlers.size
    })
    return stats
  }
}
