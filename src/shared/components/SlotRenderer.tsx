import type { SlotId } from '@/types'
import type React from 'react'

interface SlotRendererProps {
  slotId: SlotId
  slots: Map<SlotId, Array<{ id: string; slotId: SlotId; component: React.ComponentType }>>
}

/**
 * SlotRenderer - 플러그인이 등록한 UI 컴포넌트를 렌더링
 */
export const SlotRenderer: React.FC<SlotRendererProps> = ({ slotId, slots }) => {
  const components = slots.get(slotId) || []

  if (components.length === 0) {
    return null
  }

  return (
    <>
      {components.map(({ id, component: Component }) => (
        <Component key={id} />
      ))}
    </>
  )
}
