// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend
// and run `npm run sync:shared`.

import type { ObjectValues } from './utils.js'

/**
 * Steps of the recruitment process, in order. A candidate's `stage` is the step they are at.
 */
export const CANDIDATE_STAGE = {
  registered: 'registered',
  medical: 'medical',
  eNumber: 'e_number',
  dropbox: 'dropbox',
  visa: 'visa',
  /** Passport stamped at the Protector of Emigrants (emigration clearance) */
  protector: 'protector',
  ticketed: 'ticketed',
  departed: 'departed',
} as const

export const CANDIDATE_STAGE_ORDER = Object.values(CANDIDATE_STAGE)

/**
 * What can be recorded next for a candidate. Each step moves them along, the API picks the one
 * that applies (see Candidate.nextStep) and sends it with the candidate.
 */
export const CANDIDATE_STEP = {
  /** Medical result, also used to record a re-test after being unfit */
  medical: 'medical',
  /** Applied for the E-Number (protector), moves them to the E-Number stage */
  eNumberApplication: 'e_number_application',
  /** The E-Number came back */
  eNumberIssue: 'e_number_issue',
  dropbox: 'dropbox',
  /** Visa issued or rejected, a rejected visa can be recorded again */
  visa: 'visa',
  /** Protector of Emigrants stamp, with the FSA registration and insurance */
  protector: 'protector',
  /** Flight booked, can be changed until departure */
  flight: 'flight',
  departure: 'departure',
} as const

export const CANDIDATE_MEDICAL_STATUS = {
  pending: 'pending',
  fit: 'fit',
  unfit: 'unfit',
} as const

export const CANDIDATE_VISA_STATUS = {
  pending: 'pending',
  issued: 'issued',
  rejected: 'rejected',
} as const

/**
 * What happened to a candidate, for their history timeline
 */
export const CANDIDATE_ACTIVITY = {
  created: 'created',
  updated: 'updated',
  stageChanged: 'stage_changed',
  medicalFit: 'medical_fit',
  medicalUnfit: 'medical_unfit',
  eNumberIssued: 'e_number_issued',
  dropboxSubmitted: 'dropbox_submitted',
  visaIssued: 'visa_issued',
  visaRejected: 'visa_rejected',
  protectorStamped: 'protector_stamped',
  flightBooked: 'flight_booked',
  departed: 'departed',
  documentUploaded: 'document_uploaded',
  documentDeleted: 'document_deleted',
  note: 'note',
} as const

export const DOCUMENT_TYPE = {
  passport: 'passport',
  cnic: 'cnic',
  photo: 'photo',
  medicalReport: 'medical_report',
  visa: 'visa',
  ticket: 'ticket',
  other: 'other',
} as const

/**
 * Upload limits, checked by the API and shown in the upload UI
 */
export const DOCUMENT_UPLOAD = {
  maxSizeMb: 10,
  extensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'],
} as const

export type CandidateStage = ObjectValues<typeof CANDIDATE_STAGE>
export type CandidateStep = ObjectValues<typeof CANDIDATE_STEP>
export type CandidateMedicalStatus = ObjectValues<typeof CANDIDATE_MEDICAL_STATUS>
export type CandidateVisaStatus = ObjectValues<typeof CANDIDATE_VISA_STATUS>
export type CandidateActivityType = ObjectValues<typeof CANDIDATE_ACTIVITY>
export type DocumentType = ObjectValues<typeof DOCUMENT_TYPE>

/**
 * Money ledger for a candidate. A charge is what they owe (service fee, medical, protector
 * fees...), a payment is money received, a refund is money given back.
 * Balance owed = charges - payments + refunds.
 */
export const PAYMENT_KIND = {
  charge: 'charge',
  payment: 'payment',
  refund: 'refund',
} as const

export const PAYMENT_METHOD = {
  cash: 'cash',
  bankTransfer: 'bank_transfer',
  cheque: 'cheque',
  mobileWallet: 'mobile_wallet',
} as const

export type PaymentKind = ObjectValues<typeof PAYMENT_KIND>
export type PaymentMethod = ObjectValues<typeof PAYMENT_METHOD>
