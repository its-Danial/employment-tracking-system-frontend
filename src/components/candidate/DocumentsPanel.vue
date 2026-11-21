<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import candidateServices, { candidateQueries } from '@/api/services/candidate-services'
import AppCard from '@/components/AppCard.vue'
import AccessControl from '@/components/access/AccessControl.vue'
import { useConfirmDelete } from '@/composables/use-confirm-delete'
import { formatRelativeTime } from '@/lib/utils'
import { DOCUMENT_TYPE, DOCUMENT_UPLOAD, type DocumentType } from '@/shared/candidate'
import type { Candidate, CandidateDocument } from '@/shared/entities'
import { PERMISSIONS } from '@/shared/permissions'
import { useToastStore } from '@/stores/toast'

/**
 * A candidate's scans (passport, CNIC, medical report...). Files are stored encrypted and only
 * downloadable by a logged-in user with permission.
 */
const { candidate } = defineProps<{ candidate: Candidate }>()

const { t } = useI18n()
const toast = useToastStore()
const confirmDelete = useConfirmDelete()
const uploadDocument = candidateQueries.useUploadDocument()
const deleteDocument = candidateQueries.useDeleteDocument()

const type = ref<DocumentType>(DOCUMENT_TYPE.passport)
const typeOptions = computed(() =>
  Object.values(DOCUMENT_TYPE).map((value) => ({ value, label: t(`documentType.${value}`) }))
)
const fileInput = useTemplateRef('fileInput')
const error = ref<string>()
const downloading = ref<CandidateDocument['uuid']>()

const accept = DOCUMENT_UPLOAD.extensions.map((extension) => `.${extension}`).join(',')

async function handleFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Cleared so picking the same file again still fires `change`
  input.value = ''
  if (!file) return

  // Checked here for a quick answer, the API checks the same again
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!(DOCUMENT_UPLOAD.extensions as readonly string[]).includes(extension)) {
    error.value = t('documents.badType')
    return
  }
  if (file.size > DOCUMENT_UPLOAD.maxSizeMb * 1024 * 1024) {
    error.value = t('documents.tooLarge', { size: DOCUMENT_UPLOAD.maxSizeMb })
    return
  }
  error.value = undefined
  try {
    await uploadDocument.mutateAsync({ uuid: candidate.uuid, type: type.value, file })
    toast.success(t('documents.uploaded'))
  } catch {
    // The API error toast explains what went wrong
  }
}

async function download(document: CandidateDocument) {
  downloading.value = document.uuid
  try {
    const blob = await candidateServices.downloadDocument(candidate.uuid, document.uuid)
    const url = URL.createObjectURL(blob)
    const link = Object.assign(window.document.createElement('a'), {
      href: url,
      download: document.originalName,
    })
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    // The API error toast explains what went wrong
  } finally {
    downloading.value = undefined
  }
}

const remove = (document: CandidateDocument) =>
  confirmDelete({
    itemName: t('documents.deleteItem'),
    onConfirm: async () => {
      await deleteDocument.mutateAsync({ uuid: candidate.uuid, documentUuid: document.uuid })
      toast.success(t('documents.deleted'))
    },
  })

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
</script>

<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-lg font-semibold">{{ t('candidates.documents') }}</h2>

    <AppCard v-if="candidate.documents.length" class="p-0!">
      <ul class="divide-y divide-surface-200 dark:divide-surface-800">
        <li
          v-for="document in candidate.documents"
          :key="document.uuid"
          class="flex items-center gap-2 py-2 ps-4 pe-2"
        >
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="font-medium">{{ t(`documentType.${document.type}`) }}</span>
            <span class="truncate text-sm text-muted-color">
              {{ document.originalName }},
              <span dir="ltr">{{ formatSize(document.sizeBytes) }}</span
              >, {{ formatRelativeTime(document.createdAt) }}
            </span>
          </span>
          <Button
            variant="text"
            severity="secondary"
            :aria-label="t('documents.download', { name: document.originalName })"
            :loading="downloading === document.uuid"
            @click="download(document)"
          >
            <template #icon><ArrowDownTrayIcon /></template>
          </Button>
          <AccessControl :permission="PERMISSIONS.candidates.update">
            <Button
              variant="text"
              severity="secondary"
              :aria-label="t('documents.remove', { name: document.originalName })"
              class="hover:text-red-600!"
              @click="remove(document)"
            >
              <template #icon><TrashIcon /></template>
            </Button>
          </AccessControl>
        </li>
      </ul>
    </AppCard>
    <p
      v-else
      class="rounded-xl border border-dashed border-surface-300 p-6 text-center text-muted-color dark:border-surface-700"
    >
      {{ t('candidates.noDocuments') }}
    </p>

    <AccessControl :permission="PERMISSIONS.candidates.update">
      <div class="flex flex-col gap-2">
        <div class="flex gap-2">
          <Select
            v-model="type"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            :aria-label="t('documents.type')"
            class="min-w-0 flex-1"
          />
          <Button
            :label="t('documents.upload')"
            severity="secondary"
            variant="outlined"
            :loading="uploadDocument.isPending.value"
            @click="fileInput?.click()"
          >
            <template #icon><ArrowUpTrayIcon /></template>
          </Button>
          <input
            ref="fileInput"
            type="file"
            :accept
            class="hidden"
            tabindex="-1"
            :aria-label="t('documents.choose')"
            @change="handleFile"
          />
        </div>
        <Message v-if="error" severity="error" size="small" variant="simple">{{ error }}</Message>
        <small v-else class="text-muted-color">
          {{ t('documents.hint', { size: DOCUMENT_UPLOAD.maxSizeMb }) }}
        </small>
      </div>
    </AccessControl>
  </section>
</template>
