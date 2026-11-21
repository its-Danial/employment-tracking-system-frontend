// GENERATED from the backend repo (shared/). Do not edit here, edit it in the backend
// and run `npm run sync:shared`.

export type ObjectValues<T> = T[keyof T]
export type ObjectKeys<T> = keyof T

/**
 * @example "2025-04-23T11:20:12.271+00:00"
 */
export type ISODateString = string

/**
 * @example "2025-04-23"
 */
export type ISODate = `${number}-${number}-${number}`

export type UUID = `${string}-${string}-${string}-${string}-${string}`
