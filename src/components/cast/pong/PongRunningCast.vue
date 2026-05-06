<template>
  <div class="running-cast column items-center justify-center full-height">
    <!-- Game canvas -->
    <div class="relative-position canvas-wrap">
      <pong-renderer
        :frameA="frame"
        :frameB="frame"
        :renderSimTime="frame?.simTime ?? 0"
        leftColor="#2196f3"
        rightColor="#ff9800"
      />

      <!-- Paused / Game Over overlay -->
      <div
        v-if="showOverlay"
        class="absolute-full flex flex-center overlay-bg"
      >
        <div class="text-center">
          <div class="overlay-text">{{ overlayLabel }}</div>
          <div
            v-if="winnerLabel"
            class="winner-label q-mt-sm"
          >
            {{ winnerLabel }}
          </div>
        </div>
      </div>
    </div>

    <!-- Score bar below canvas -->
    <div class="score-bar row q-mt-md q-col-gutter-xl justify-center">
      <div class="col-auto text-center">
        <div
          class="score-number"
          style="color: #2196f3"
        >
          {{ frame?.left.score ?? 0 }}
        </div>
        <div class="score-label text-grey-5">
          {{ t('cast.pong.running.left') }}
        </div>
      </div>
      <div class="col-auto text-center self-center text-grey-6 text-h5">—</div>
      <div class="col-auto text-center">
        <div
          class="score-number"
          style="color: #ff9800"
        >
          {{ frame?.right.score ?? 0 }}
        </div>
        <div class="score-label text-grey-5">
          {{ t('cast.pong.running.right') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PongRenderer from 'components/gameModes/pong/PongRenderer.vue';
import type {
  PongRunningState,
  PongPaused,
  PongEnded,
} from 'app/common/gameState/PongState';
import type { StageFrame } from 'components/gameModes/pong/PongTypes';

const { t } = useI18n();

const props = defineProps<{
  state: PongRunningState | PongPaused | PongEnded;
}>();

const TARGET_SCORE = 7;

const frame = computed<StageFrame | null>(() => props.state.frame ?? null);

const showOverlay = computed(
  () =>
    props.state.name === 'paused' || props.state.name === 'completed',
);

const overlayLabel = computed(() => {
  if (props.state.name === 'paused') return t('cast.pong.running.paused');
  if (props.state.name === 'completed') return t('cast.pong.running.gameOver');
  return '';
});

const winnerLabel = computed(() => {
  if (props.state.name !== 'completed') return '';
  const f = frame.value;
  if (!f) return '';
  if (f.left.score >= TARGET_SCORE) {
    return `${t('cast.pong.running.left')} ${t('cast.pong.running.wins')}`;
  }
  return `${t('cast.pong.running.right')} ${t('cast.pong.running.wins')}`;
});
</script>

<style scoped>
.running-cast {
  min-height: 100vh;
  background: #0a0a1a;
}

.canvas-wrap {
  display: inline-flex;
}

.overlay-bg {
  background: rgba(0, 0, 0, 0.72);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.overlay-text {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  color: white;
  letter-spacing: 0.05em;
}

.winner-label {
  font-size: clamp(1.2rem, 3vw, 2rem);
  color: rgba(255, 255, 255, 0.8);
}

.score-bar {
  min-width: 300px;
}

.score-number {
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 700;
  font-family: monospace;
}

.score-label {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>
