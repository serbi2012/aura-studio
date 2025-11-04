// 벡터 타입 정의
export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Point, Size {}

// Transform Matrix (3x3)
export interface Transform {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  skewX: number
  skewY: number
}

// 색상
export interface Color {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
  a: number // 0-1
}

export function colorToString(color: Color): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
}

export function hexToColor(hex: string): Color {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 0, g: 0, b: 0, a: 1 }
  }
  return {
    r: Number.parseInt(result[1] ?? '0', 16),
    g: Number.parseInt(result[2] ?? '0', 16),
    b: Number.parseInt(result[3] ?? '0', 16),
    a: 1,
  }
}

// Shape 타입
export type ShapeType = 'rect' | 'ellipse' | 'path' | 'polygon' | 'line' | 'text' | 'group'

// Fill & Stroke
export type FillType = 'solid' | 'gradient' | 'pattern'

export interface SolidFill {
  type: 'solid'
  color: Color
  opacity: number
}

export interface GradientFill {
  type: 'gradient'
  gradientType: 'linear' | 'radial'
  stops: GradientStop[]
  opacity: number
  // linear
  start?: Point
  end?: Point
  // radial
  center?: Point
  radius?: number
}

export interface GradientStop {
  offset: number // 0-1
  color: Color
}

export type Fill = SolidFill | GradientFill

export interface Stroke {
  color: Color
  width: number
  opacity: number
  cap: 'butt' | 'round' | 'square'
  join: 'miter' | 'round' | 'bevel'
  dashArray?: number[]
  dashOffset?: number
}

// Shape 데이터
export interface RectData {
  width: number
  height: number
  cornerRadius?: number
}

export interface EllipseData {
  radiusX: number
  radiusY: number
}

export interface PathSegment {
  point: Point
  handleIn?: Point // 상대 좌표
  handleOut?: Point // 상대 좌표
}

export interface PathData {
  segments: PathSegment[]
  closed: boolean
}

export interface PolygonData {
  points: Point[]
}

export interface LineData {
  points: Point[]
}

export type ShapeData = RectData | EllipseData | PathData | PolygonData | LineData

// Shape 오브젝트
export interface Shape {
  id: string
  type: ShapeType
  name: string

  // 변형
  transform: Transform

  // 스타일
  fill?: Fill
  stroke?: Stroke
  opacity: number

  // 구조
  layerId: string
  locked: boolean
  visible: boolean

  // 데이터
  data: ShapeData
}

// Artboard
export interface Artboard {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  backgroundColor: Color
  showGrid: boolean
  gridSize: number
}

// Viewport
export interface Viewport {
  x: number // 팬 위치
  y: number
  zoom: number // 1.0 = 100%
}
