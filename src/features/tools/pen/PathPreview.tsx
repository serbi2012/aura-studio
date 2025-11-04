import type { PathData } from '@/types/vector'
import type React from 'react'
import { Circle as CircleIcon, Line } from 'react-konva'

export interface PathPreviewProps {
  pathData: PathData | null
  zoom: number
}

export const PathPreview: React.FC<PathPreviewProps> = ({ pathData, zoom }) => {
  if (!pathData || pathData.segments.length === 0) return null

  const segments = pathData.segments
  const handleRadius = 4 / zoom
  const anchorRadius = 6 / zoom
  const lineWidth = 2 / zoom

  const renderSegment = (index: number) => {
    const segment = segments[index]
    if (!segment) return null

    const nextSegment = segments[index + 1]
    const elements: JSX.Element[] = []

    elements.push(
      <CircleIcon
        key={`anchor-${index}`}
        x={segment.point.x}
        y={segment.point.y}
        radius={anchorRadius}
        fill="#0066FF"
        stroke="white"
        strokeWidth={lineWidth}
      />,
    )

    if (segment.handleOut) {
      const handleX = segment.point.x + segment.handleOut.x
      const handleY = segment.point.y + segment.handleOut.y

      elements.push(
        <Line
          key={`handle-out-line-${index}`}
          points={[segment.point.x, segment.point.y, handleX, handleY]}
          stroke="#0066FF"
          strokeWidth={lineWidth}
          dash={[4 / zoom, 4 / zoom]}
        />,
      )

      elements.push(
        <CircleIcon
          key={`handle-out-${index}`}
          x={handleX}
          y={handleY}
          radius={handleRadius}
          fill="white"
          stroke="#0066FF"
          strokeWidth={lineWidth}
        />,
      )
    }

    if (segment.handleIn) {
      const handleX = segment.point.x + segment.handleIn.x
      const handleY = segment.point.y + segment.handleIn.y

      elements.push(
        <Line
          key={`handle-in-line-${index}`}
          points={[segment.point.x, segment.point.y, handleX, handleY]}
          stroke="#0066FF"
          strokeWidth={lineWidth}
          dash={[4 / zoom, 4 / zoom]}
        />,
      )

      elements.push(
        <CircleIcon
          key={`handle-in-${index}`}
          x={handleX}
          y={handleY}
          radius={handleRadius}
          fill="white"
          stroke="#0066FF"
          strokeWidth={lineWidth}
        />,
      )
    }

    if (nextSegment) {
      elements.push(
        <Line
          key={`line-${index}`}
          points={[segment.point.x, segment.point.y, nextSegment.point.x, nextSegment.point.y]}
          stroke="#0066FF"
          strokeWidth={lineWidth}
        />,
      )
    }

    return elements
  }

  return <>{segments.map((_, index) => renderSegment(index))}</>
}
