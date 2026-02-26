import type { InitializationStepStatus, InitializationStepUpdate } from './types'

export interface InitializationStepDefinition {
  id: string
  label: string
  order: number
}

export const EH_INITIALIZATION_STEPS: InitializationStepDefinition[] = [
  { id: 'parseImagePageMetadata', label: 'Parse image page metadata', order: 1 },
  { id: 'fetchIntroPages', label: 'Fetch intro pages', order: 2 },
  { id: 'extractImagePagesAndThumbnails', label: 'Extract image pages and thumbnails', order: 3 }
]

export const NH_INITIALIZATION_STEPS: InitializationStepDefinition[] = [
  { id: 'parseImagePageMetadata', label: 'Parse image page metadata', order: 1 },
  { id: 'fetchIntroPage', label: 'Fetch intro page', order: 2 },
  { id: 'extractTitle', label: 'Extract title', order: 3 },
  { id: 'extractImagePagesAndThumbnails', label: 'Extract image pages and thumbnails', order: 4 }
]

export function createStepMap(
  stepDefinitions: InitializationStepDefinition[]
): Record<string, InitializationStepDefinition> {
  return stepDefinitions.reduce<Record<string, InitializationStepDefinition>>((map, step) => {
    map[step.id] = step
    return map
  }, {})
}

export function createStepUpdate(
  step: { id: string; label: string; order?: number },
  status: InitializationStepStatus,
  detail?: string
): InitializationStepUpdate {
  return {
    id: step.id,
    label: step.label,
    order: step.order,
    status,
    detail
  }
}

export function markCurrentPendingStepFailed(
  stepOrder: string[],
  stepStatus: Record<string, InitializationStepStatus>,
  stepMap: Record<string, { id: string; label: string; order?: number }>,
  reason: string,
  reportStep: (step: InitializationStepUpdate) => void
): void {
  const currentStepId = stepOrder.find(stepId => stepStatus[stepId] === 'pending')
  if (!currentStepId) {
    return
  }

  const step = stepMap[currentStepId]
  if (!step) {
    return
  }

  reportStep(createStepUpdate(step, 'failed', reason))
}
