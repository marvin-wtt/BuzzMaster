<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="min-width: 350px; width: 400px"
    >
      <q-card-section class="text-center text-h5">
        {{ t('question.stopwatch.scores.title') }}
      </q-card-section>

      <q-card-section>
        <q-list>
          <q-item
            v-for="(entry, index) in result"
            :key="entry.controller.id"
          >
            <q-item-section avatar>
              <q-avatar
                :color="avatarColor(index)"
                text-color="white"
                size="sm"
              >
                <template v-if="entry.time !== undefined">
                  {{ index + 1 }}
                </template>
                <template v-else> - </template>
              </q-avatar>
            </q-item-section>

            <q-item-section>
              {{ entry.controller.name }}
            </q-item-section>

            <q-item-section side>
              <q-input
                v-model.number="updatedScores[entry.controller.id]"
                :label="t('question.stopwatch.scores.field')"
                type="number"
                outlined
                rounded
                dense
                clearable
                style="width: 100px"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('question.stopwatch.scores.action.ok')"
          color="primary"
          rounded
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ref, toRaw } from 'vue';
import { StopwatchEntry } from 'components/questions/stopwatch/StopwatchEntry';

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const props = defineProps<{
  result: StopwatchEntry[];
  scores: Record<string, number | undefined>;
}>();

const updatedScores = ref<Record<string, number | undefined>>(
  structuredClone(toRaw(props.scores)),
);

defineEmits([...useDialogPluginComponent.emits]);

const avatarColor = (index: number) => {
  switch (index) {
    case 0:
      return 'primary';
    case 1:
      return 'secondary';
    case 2:
      return 'info';
  }

  return 'grey';
};

const onSave = () => {
  onDialogOK(updatedScores.value);
};
</script>

<style scoped></style>
