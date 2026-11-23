import { useConfirm } from 'primevue/useconfirm'
import { useI18n } from 'vue-i18n'

interface ConfirmDeleteOptions {
  /** What is being deleted, shown in the message, e.g. `the trade "Welder"` */
  itemName: string
  onConfirm: () => void | Promise<void>
}

/**
 * Asks before deleting anything, with a clear red "Delete" and a safe default "Cancel".
 *
 * @example
 * const confirmDelete = useConfirmDelete()
 * confirmDelete({ itemName: `the trade "${trade.name}"`, onConfirm: () => deleteTrade(trade.uuid) })
 */
export function useConfirmDelete() {
  const confirm = useConfirm()
  const { t } = useI18n()

  return ({ itemName, onConfirm }: ConfirmDeleteOptions) =>
    confirm.require({
      header: t('confirm.deleteTitle'),
      message: t('confirm.deleteMessage', { item: itemName }),
      rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
      acceptProps: { label: t('common.delete'), severity: 'danger' },
      defaultFocus: 'reject',
      accept: async () => {
        try {
          await onConfirm()
        } catch {
          // The API error toast already says why (e.g. still in use), nothing else to do
        }
      },
    })
}
