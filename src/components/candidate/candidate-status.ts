import {
  CANDIDATE_MEDICAL_STATUS,
  CANDIDATE_STAGE,
  CANDIDATE_STAGE_ORDER,
  CANDIDATE_VISA_STATUS,
} from '@/shared/candidate'
import type { CandidateSummary } from '@/shared/entities'

export type CandidateTone = 'waiting' | 'moving' | 'departed' | 'blocked'

type StatusFields = Pick<CandidateSummary, 'stage' | 'medicalStatus' | 'visaStatus'>

/**
 * Medically unfit or visa rejected: the candidate can't move forward until someone acts
 */
export const isBlocked = (candidate: StatusFields) =>
  candidate.medicalStatus === CANDIDATE_MEDICAL_STATUS.unfit ||
  candidate.visaStatus === CANDIDATE_VISA_STATUS.rejected

export function toneOf(candidate: StatusFields): CandidateTone {
  if (isBlocked(candidate)) return 'blocked'
  if (candidate.stage === CANDIDATE_STAGE.departed) return 'departed'
  if (candidate.stage === CANDIDATE_STAGE.registered) return 'waiting'
  return 'moving'
}

/** 0 for registered up to 6 for departed */
export const stageIndex = (candidate: Pick<CandidateSummary, 'stage'>) =>
  CANDIDATE_STAGE_ORDER.indexOf(candidate.stage)
