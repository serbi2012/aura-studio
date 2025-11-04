import { Button } from '@/shared/components/Button'
import { Tooltip } from '@/shared/components/Tooltip'
import { MousePointer2 } from 'lucide-react'
import type React from 'react'

interface SelectToolUIProps {
  isActive: boolean
  onActivate: () => void
}

export const SelectToolUI: React.FC<SelectToolUIProps> = ({ isActive, onActivate }) => {
  return (
    <Tooltip content="선택 도구 (V)">
      <Button
        size="icon"
        variant={isActive ? 'default' : 'ghost'}
        onClick={onActivate}
        className="w-10 h-10"
      >
        <MousePointer2 className="h-5 w-5" />
      </Button>
    </Tooltip>
  )
}
