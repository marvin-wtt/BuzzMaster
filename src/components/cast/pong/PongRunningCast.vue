<template>
  <div class="running-cast">
    <!-- Canvas -->
    <div class="canvas-area">
      <div class="relative-position">
        <pong-renderer
          :frameA="frame"
          :frameB="frame"
          :renderSimTime="frame?.simTime ?? 0"
          leftColor="#2196f3"
          rightColor="#ff9800"
          :fullWidth="true"
        />

        <!-- Paused / Game Over overlay -->
        <transition name="fade">
          <div
            v-if="showOverlay"
            class="absolute-full flex flex-center overlay-bg"
          >
            <div class="text-center">
              <div class="overlay-text">
                {{ overlayLabel }}
              </div>
              <div
                v-if="winnerLabel"
                class="winner-label q-mt-sm"
              >
                {{ winnerLabel }}
              </div>
            </div>
          </div>
        </transition>
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

const showOverlay = computed(() => {
  return props.state.name === 'paused' || props.state.name === 'completed';
});

const overlayLabel = computed(() => {
  if (props.state.name === 'paused') {
    return t('cast.pong.running.paused');
  }
  if (props.state.name === 'completed') {
    return t('cast.pong.running.gameOver');
  }
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
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Score header ─────────────────────────────────── */
.score-header {
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0 2rem;
  /* Subtle separator between header and canvas */
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
}

.team-side {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.team-label {
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.65;
}

.team-left .team-label {
  color: #2196f3;
}

.team-right .team-label {
  color: #ff9800;
}

.score-digit {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  font-weight: 700;
  font-family: monospace;
  line-height: 1;
  min-width: 2ch;
  text-align: center;
}

.divider {
  font-size: 1.4rem;
  opacity: 0.3;
}

/* ── Canvas area ──────────────────────────────────── */
.canvas-area {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Overlays ─────────────────────────────────────── */
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
