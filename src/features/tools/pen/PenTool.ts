import type { PathData, PathSegment, Point } from '@/types/vector'

export interface PenToolConfig {
  onPathComplete?: (path: PathData) => void
  onPathUpdate?: (path: PathData) => void
}

export class PenTool {
  private isActive = false
  private isDrawing = false

  private currentPath: PathSegment[] = []
  private tempSegment: PathSegment | null = null
  private dragStartPoint: Point | null = null

  private isShiftPressed = false
  private isAltPressed = false

  constructor(private config: PenToolConfig) {}

  onActivate(): void {
    this.isActive = true
    this.reset()
  }

  onDeactivate(): void {
    this.isActive = false
    this.completePath()
  }

  onPointerDown(point: Point): void {
    if (!this.isActive) return

    if (this.currentPath.length > 0) {
      const firstPoint = this.currentPath[0]?.point
      if (firstPoint && this.isNearPoint(point, firstPoint, 10)) {
        this.closePath()
        return
      }
    }

    this.isDrawing = true
    this.dragStartPoint = point
    this.tempSegment = { point: { ...point } }
  }

  onPointerMove(point: Point): void {
    if (!this.isActive || !this.isDrawing || !this.dragStartPoint || !this.tempSegment) return

    const dx = point.x - this.dragStartPoint.x
    const dy = point.y - this.dragStartPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 2) {
      let handleX = dx
      let handleY = dy

      if (this.isShiftPressed) {
        const angle = Math.atan2(dy, dx)
        const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
        const length = Math.sqrt(dx * dx + dy * dy)
        handleX = Math.cos(snapAngle) * length
        handleY = Math.sin(snapAngle) * length
      }

      this.tempSegment.handleOut = { x: handleX, y: handleY }

      if (this.currentPath.length > 0 && !this.isAltPressed) {
        const prevSegment = this.currentPath[this.currentPath.length - 1]
        if (prevSegment) {
          prevSegment.handleIn = { x: -handleX, y: -handleY }
        }
      }

      this.notifyUpdate()
    }
  }

  onPointerUp(_point: Point): void {
    if (!this.isActive || !this.tempSegment) return

    this.currentPath.push(this.tempSegment)

    this.isDrawing = false
    this.tempSegment = null
    this.dragStartPoint = null

    this.notifyUpdate()
  }

  onKeyDown(e: KeyboardEvent): void {
    if (!this.isActive) return

    if (e.key === 'Shift') {
      this.isShiftPressed = true
    } else if (e.key === 'Alt') {
      this.isAltPressed = true
    } else if (e.key === 'Enter') {
      this.completePath()
    } else if (e.key === 'Escape') {
      this.cancelPath()
    }
  }

  onKeyUp(e: KeyboardEvent): void {
    if (e.key === 'Shift') {
      this.isShiftPressed = false
    } else if (e.key === 'Alt') {
      this.isAltPressed = false
    }
  }

  private closePath(): void {
    if (this.currentPath.length < 2) return

    const pathData: PathData = {
      segments: [...this.currentPath],
      closed: true,
    }

    this.config.onPathComplete?.(pathData)
    this.reset()
  }

  private completePath(): void {
    if (this.currentPath.length < 2) {
      this.reset()
      return
    }

    const pathData: PathData = {
      segments: [...this.currentPath],
      closed: false,
    }

    this.config.onPathComplete?.(pathData)
    this.reset()
  }

  private cancelPath(): void {
    this.reset()
  }

  private reset(): void {
    this.currentPath = []
    this.tempSegment = null
    this.dragStartPoint = null
    this.isDrawing = false
  }

  private notifyUpdate(): void {
    const segments = [...this.currentPath]
    if (this.tempSegment) {
      segments.push(this.tempSegment)
    }

    if (segments.length > 0) {
      const pathData: PathData = {
        segments,
        closed: false,
      }
      this.config.onPathUpdate?.(pathData)
    }
  }

  private isNearPoint(p1: Point, p2: Point, threshold: number): boolean {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy) < threshold
  }
}
