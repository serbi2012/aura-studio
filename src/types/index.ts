// 기본 타입들
export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Point, Size {}

export interface Transform {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  skewX: number
  skewY: number
}

// 레이어 타입
export type LayerType = 'vector' | 'raster' | 'group' | 'text'

export interface Layer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  opacity: number
  transform: Transform
  bounds: Rect
  parentId?: string
  children?: string[]
}

// 도구 타입
export interface Tool {
  id: string
  name: string
  icon?: string
  cursor?: string
  hotkey?: string

  onActivate?(): void
  onDeactivate?(): void
  onPointerDown?(e: PointerEvent): void
  onPointerMove?(e: PointerEvent): void
  onPointerUp?(e: PointerEvent): void
  onKeyDown?(e: KeyboardEvent): void
  onKeyUp?(e: KeyboardEvent): void
}

// 명령 타입
export interface Command {
  id: string
  name: string

  execute(...args: unknown[]): void | Promise<void>
  undo?(): void | Promise<void>
  redo?(): void | Promise<void>

  merge?(command: Command): boolean
}

// 메뉴 항목
export interface MenuItem {
  id: string
  label: string
  icon?: string
  hotkey?: string
  onClick?: () => void
  submenu?: MenuItem[]
  separator?: boolean
}

// 단축키
export interface Hotkey {
  id: string
  keys: string
  description?: string
  handler: (e: KeyboardEvent) => void
}

// UI 슬롯
export type SlotId =
  | 'toolbar-left'
  | 'toolbar-right'
  | 'toolbar-top'
  | 'panel-left'
  | 'panel-right'
  | 'panel-bottom'
  | 'menu'
  | 'statusbar'

export interface SlotComponent {
  id: string
  slotId: SlotId
  priority?: number
  component: React.ComponentType
}
