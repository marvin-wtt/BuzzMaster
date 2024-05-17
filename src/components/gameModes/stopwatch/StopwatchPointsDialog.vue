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
        {{ t('gameMode.stopwatch.points.title') }}
      </q-card-section>

      <q-card-section>
        <q-list>
          <q-item
            v-for="(entry, index) in result"
            :key="entry.controller.id"
          >
            <q-item-section avatar>
              <q-avatar
                v-if="entry.time !== undefined"
                :color="avatarColor(index)"
                text-color="white"
                size="sm"
              >
                {{ index + 1 }}
              </q-avatar>
              <q-avatar
                v-else
                color="grey"
                text-color="white"
                size="sm"
              >
                -
              </q-avatar>
            </q-item-section>

            <q-item-section>
              {{ entry.controller.name }}
            </q-item-section>

            <q-item-section side>
              <q-input
                v-model.number="updatedPoints[entry.controller.id]"
                :label="t('gameMode.stopwatch.points.field')"
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
          :label="t('gameMode.stopwatch.points.action.ok')"
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
import { StopwatchEntry } from 'components/gameModes/stopwatch/StopwatchEntry';

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const props = defineProps<{
  result: StopwatchEntry[];
  points: Record<string, number | undefined>;
}>();

const updatedPoints = ref<Record<string, number | undefined>>(
  structuredClone(toRaw(props.points)),
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
  onDialogOK(updatedPoints.value);
};
</script>

<style scoped></style>
