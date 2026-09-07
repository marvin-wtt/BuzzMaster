<template>
  <div class="col-12 column no-wrap">
    <!-- Remaining time, read across the room in one glance -->
    <div
      class="cast-track"
      :class="`cast-track--${tone}`"
    >
      <span :style="{ width: `${remaining * 100}%` }" />
    </div>

    <div class="col-grow column justify-center text-center q-pa-xl">
      <div class="cast-label">
        {{ t('cast.buzzer.answering.label') }}
      </div>

      <text-dynamic :name="controllers[state.controller]!">
        <timer-animated
          v-if="settings.answerTime > 0"
          :time="state.time"
          :precision="1"
          class="bm-num"
          :class="`cast-count--${tone}`"
        />
      </text-dynamic>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCastStore } from 'stores/cast-store';
import type { BuzzerAnsweringState } from 'app/common/gameState/BuzzerState';
import TimerAnimated from 'components/TimerAnimated.vue';
import TextDynamic from 'components/TextDynamic.vue';
import type { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const settings = computed<BuzzerSettings>(() => {
  return castStore.gameSettings.buzzer;
});

const { state } = defineProps<{
  state: BuzzerAnsweringState;
}>();

const remaining = computed<number>(() => {
  const total = settings.value.answerTime;

  if (total <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, state.time / total));
});

/** Same thresholds the host sees on the control window. */
const tone = computed<'calm' | 'warn' | 'alert'>(() => {
  if (state.time <= 3) {
    return 'alert';
  }

  return state.time <= 5 ? 'warn' : 'calm';
});
</script>

<style lang="scss" scoped>
.cast-track {
  flex: 0 0 auto;
  height: 8px;
  background: var(--bm-line);
  color: var(--bm-ink);
}

.cast-track span {
  display: block;
  height: 100%;
  background: currentColor;
  transition: width 0.1s linear;
}

.cast-track--warn {
  color: var(--bm-warn);
}

.cast-track--alert {
  color: var(--bm-accent-text);
}

.cast-label {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--bm-dim);
  margin-bottom: 0.6em;
}

.cast-count--warn {
  color: var(--bm-warn);
}

.cast-count--alert {
  color: var(--bm-accent-text);
}
</style>
