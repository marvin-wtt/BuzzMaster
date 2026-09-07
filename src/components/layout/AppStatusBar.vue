<template>
  <div class="bm-status">
    <!-- Controllers -->
    <button
      type="button"
      class="bm-stat"
      :class="{ 'bm-stat--warn': controllers.length === 0 }"
      @click="goToDevices"
    >
      <span
        class="bm-stat__dot"
        :style="{ color: controllers.length > 0 ? 'var(--bm-ok)' : undefined }"
      />
      {{ t('toolbar.status.controllers', controllers.length) }}
      <q-tooltip>
        {{ t('toolbar.status.controllersHint') }}
      </q-tooltip>
    </button>

    <!-- Cast window -->
    <button
      v-if="castSupported"
      type="button"
      class="bm-stat"
      :class="{ 'bm-stat--live': castOpen }"
      @click="toggleCast"
    >
      <span class="bm-stat__dot" />
      {{ castOpen ? t('toolbar.status.castOn') : t('toolbar.status.castOff') }}
      <q-tooltip>
        {{ t('toolbar.cast') }}
      </q-tooltip>
    </button>

    <!-- Controllers about to fall asleep -->
    <button
      v-if="criticalBatterySavingTimes.length > 0"
      type="button"
      class="bm-stat bm-stat--warn"
      @click="showBatterySaving"
    >
      <q-icon
        name="battery_saver"
        size="13px"
      />
      {{ t('toolbar.status.battery', criticalBatterySavingTimes.length) }}
      <q-tooltip>
        {{ t('toolbar.status.batteryHint') }}
      </q-tooltip>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useBuzzer } from 'src/plugins/buzzer';
import { useBatterySavingStore } from 'stores/battery-saving-store';
import BatterySavingDialog from 'components/layout/BatterySavingDialog.vue';

/**
 * The one line that is always on screen during a show: how many controllers
 * are live, whether the audience is seeing anything, and whether a controller
 * is about to fall asleep. Every chip is also the shortcut to the screen that
 * fixes it.
 */

const { t } = useI18n();
const quasar = useQuasar();
const router = useRouter();
const { controllers } = useBuzzer();
const { criticalBatterySavingTimes } = storeToRefs(useBatterySavingStore());

const castSupported = quasar.platform.is.electron;
const castOpen = ref<boolean>(false);

onMounted(() => {
  if (!castSupported) {
    return;
  }

  window.castAPI.onWindowStateUpdate((open) => {
    castOpen.value = open;
  });
  window.castAPI.requestWindowState();
});

function toggleCast() {
  window.castAPI?.toggle();
}

async function goToDevices() {
  await router.push({ name: 'devices' });
}

function showBatterySaving() {
  quasar.dialog({
    component: BatterySavingDialog,
  });
}
</script>
