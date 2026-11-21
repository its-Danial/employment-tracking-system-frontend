import api from '@/api'
import endpoints from '@/api/endpoints'
import type { DocumentType } from '@/shared/candidate'
import type {
  Candidate,
  CandidateDocument,
  CandidateRequest,
  CandidateStepRequest,
} from '@/shared/entities'
import type {
  CandidateFilterOptionsResponse,
  CandidateFormOptionsResponse,
  CandidateResponse,
  CandidatesQuery,
  CandidatesResponse,
  DashboardResponse,
} from './types'

export default {
  async fetchDashboard(signal?: AbortSignal) {
    return (await api.get<DashboardResponse>(endpoints.DASHBOARD, { signal })).data
  },
  async fetchCandidates(params?: CandidatesQuery, signal?: AbortSignal) {
    return (await api.get<CandidatesResponse>(endpoints.CANDIDATES, { params, signal })).data
  },
  async fetchCandidate(uuid: Candidate['uuid'], signal?: AbortSignal) {
    return (await api.get<CandidateResponse>(endpoints.CANDIDATE(uuid), { signal })).data
  },
  async fetchFilterOptions(signal?: AbortSignal) {
    return (
      await api.get<CandidateFilterOptionsResponse>(endpoints.CANDIDATE_FILTER_OPTIONS, { signal })
    ).data
  },
  async fetchFormOptions(signal?: AbortSignal) {
    return (
      await api.get<CandidateFormOptionsResponse>(endpoints.CANDIDATE_FORM_OPTIONS, { signal })
    ).data
  },
  async createCandidate(payload: CandidateRequest) {
    return (await api.post<CandidateResponse>(endpoints.CANDIDATES, payload)).data
  },
  async updateCandidate(uuid: Candidate['uuid'], payload: CandidateRequest) {
    return (await api.put<CandidateResponse>(endpoints.CANDIDATE(uuid), payload)).data
  },
  async recordStep(uuid: Candidate['uuid'], payload: CandidateStepRequest) {
    return (await api.post<CandidateResponse>(endpoints.CANDIDATE_STEPS(uuid), payload)).data
  },
  async uploadDocument(uuid: Candidate['uuid'], type: DocumentType, file: File) {
    const form = new FormData()
    form.append('type', type)
    form.append('file', file)
    return (await api.post<CandidateResponse>(endpoints.CANDIDATE_DOCUMENTS(uuid), form)).data
  },
  /**
   * Documents are only served to a logged-in user with permission, so they're fetched with
   * the access token (a plain link wouldn't carry it)
   */
  async downloadDocument(uuid: Candidate['uuid'], documentUuid: CandidateDocument['uuid']) {
    const url = endpoints.CANDIDATE_DOCUMENT_DOWNLOAD(uuid, documentUuid)
    return (await api.get<Blob>(url, { responseType: 'blob' })).data
  },
  async deleteDocument(uuid: Candidate['uuid'], documentUuid: CandidateDocument['uuid']) {
    return (await api.delete<CandidateResponse>(endpoints.CANDIDATE_DOCUMENT(uuid, documentUuid)))
      .data
  },
}
