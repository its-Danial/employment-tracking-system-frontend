// This file contains global utility types used across the codebase

export type ObjectValues<T> = T[keyof T]
export type ObjectKeys<T> = keyof T

/**
 * ISO date string type
 * @example "2025-04-23T11:20:12.271+00:00"
 */
export type ISODateString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}${string}`

/**
 * node:crypto.randomUUID()
 */
export type UUID = `${string}-${string}-${string}-${string}-${string}`
