const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([disabled]):not([readonly])',
  'textarea:not([disabled])',
  '[role="combobox"]:not([aria-disabled="true"])',
].join(', ')

/**
 * PrimeVue's Dialog focuses the first `[autofocus]` element when it opens, or its close button
 * if there is none. Call this from the dialog's `@show` (it runs before that focus) to mark the
 * first field instead, so typing can start straight away.
 */
export function markFirstField(container?: Element | null) {
  container?.querySelector(FIELD_SELECTOR)?.setAttribute('autofocus', '')
}
