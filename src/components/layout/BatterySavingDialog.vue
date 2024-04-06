<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="max-width: 22rem"
    >
      <q-card-section>
        <a class="text-h5">
          {{ t('batterySaving.title') }}
        </a>
      </q-card-section>

      <q-card-section
        v-if="items.length === 0"
        class="text-h6"
      >
        {{ t('batterySaving.noEntries') }}
      </q-card-section>

      <q-card-section
        v-else
        class="q-gutter-y-sm"
      >
        <q-virtual-scroll
          style="max-height: 50vh"
          :items="items"
          v-slot="{ item }: { item: BatterySavingEntry }"
        >
          <q-item
            :key="item.id"
            dense
          >
            <q-item-section>
              {{ item.name }}
            </q-item-section>

            <q-item-section
              v-if="item.state === 'sleeping'"
              side
            >
              <q-icon name="power_settings_new" />
            </q-item-section>
            <q-item-section
              v-else-if="item.state === 'unknown'"
              side
            >
              <q-icon name="question_mark" />
            </q-item-section>
            <q-item-section
              v-else
              side
            >
              {{ formatTime(item.time) }}
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </q-card-section>

      <q-card-section>
        <q-toggle
          v-model="showAll"
          :label="t('batterySaving.field.showAll')"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('batterySaving.action.ok')"
          color="primary"
          rounded
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';
import {
  BatterySavingEntry,
  useBatterySavingStore,
} from 'stores/battery-saving-store';
import { computed, ref } from 'vue';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();
const batterySavingStore = useBatterySavingStore();

const showAll = ref<boolean>(false);

const items = computed<BatterySavingEntry[]>(() => {
  return showAll.value
    ? batterySavingStore.batterySavingTimes
    : batterySavingStore.criticalBatterySavingTimes;
});

const formatTime = (time: number) => {
  const date = new Date(time * 1000);

  let timeString = '';

  // Minutes
  if (date.getUTCMinutes() > 0) {
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    timeString = `${minutes}:`;
  }

  // Seconds
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  timeString += `${seconds}`;

  return timeString;
};
</script>

<style scoped></style>
