import type { Tool } from '@/types'

/**
 * SelectTool - 오브젝트 선택 도구
 */
export class SelectTool implements Tool {
  id = 'tool.select'
  name = 'Select Tool'
  icon = 'pointer'
  cursor = 'default'
  hotkey = 'V'

  private isActive = false
  private isDragging = false
  private startPos = { x: 0, y: 0 }

  constructor(
    private onDragStart?: (pos: { x: number; y: number }) => void,
    private onDragMove?: (pos: { x: number; y: number }) => void,
    private onDragEnd?: () => void,
  ) {}

  onActivate(): void {
    this.isActive = true
    console.log('[SelectTool] Activated')
  }

  onDeactivate(): void {
    this.isActive = false
    this.isDragging = false
    console.log('[SelectTool] Deactivated')
  }

  onPointerDown(e: PointerEvent): void {
    if (!this.isActive) return

    this.isDragging = true
    this.startPos = { x: e.clientX, y: e.clientY }

    if (this.onDragStart) {
      this.onDragStart(this.startPos)
    }
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.isActive || !this.isDragging) return

    const currentPos = { x: e.clientX, y: e.clientY }

    if (this.onDragMove) {
      this.onDragMove(currentPos)
    }
  }

  onPointerUp(_e: PointerEvent): void {
    if (!this.isActive) return

    this.isDragging = false

    if (this.onDragEnd) {
      this.onDragEnd()
    }
  }
}
