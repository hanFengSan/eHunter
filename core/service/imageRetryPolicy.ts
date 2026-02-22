import { ImgSrcMode } from '../model/model'

export interface ImageRetryPolicyOptions {
    autoRetryByOtherSource: boolean
    supportChangeSource: boolean
}

export interface ImageRetryStage {
    mode: ImgSrcMode
    attempts: number
}

const defaultOnlyRetryStages: ImageRetryStage[] = [
    { mode: ImgSrcMode.Default, attempts: 3 },
]

const sourceFallbackRetryStages: ImageRetryStage[] = [
    { mode: ImgSrcMode.Default, attempts: 2 },
    { mode: ImgSrcMode.ChangeSource, attempts: 2 },
    { mode: ImgSrcMode.Origin, attempts: 2 },
]

export function getImageRetryStages(options: ImageRetryPolicyOptions): ImageRetryStage[] {
    if (options.autoRetryByOtherSource && options.supportChangeSource) {
        return sourceFallbackRetryStages
    }
    return defaultOnlyRetryStages
}

export function buildRetryQueueAfterFailure(
    failedMode: ImgSrcMode,
    options: ImageRetryPolicyOptions,
): ImgSrcMode[] {
    const stages = getImageRetryStages(options)
    const failedStageIndex = stages.findIndex(stage => stage.mode === failedMode)
    if (failedStageIndex < 0) {
        return []
    }

    const queue: ImgSrcMode[] = []
    const failedStage = stages[failedStageIndex]
    const retriesForCurrentStage = Math.max(failedStage.attempts - 1, 0)
    for (let i = 0; i < retriesForCurrentStage; i++) {
        queue.push(failedStage.mode)
    }

    for (let stageIndex = failedStageIndex + 1; stageIndex < stages.length; stageIndex++) {
        const stage = stages[stageIndex]
        for (let i = 0; i < stage.attempts; i++) {
            queue.push(stage.mode)
        }
    }

    return queue
}
