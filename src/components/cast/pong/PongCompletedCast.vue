<template>
  <div class="completed-cast">
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

        <div class="absolute-full flex flex-center overlay-bg">
          <div class="text-center">
            <div class="overlay-text">
              {{ t('cast.pong.completed.gameOver') }}
            </div>
            <div
              v-if="winnerLabel"
              class="winner-label q-mt-sm"
            >
              {{ winnerLabel }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import PongRenderer from 'components/gameModes/pong/PongRenderer.vue';
import type { PongEnded } from 'app/common/gameState/PongState';
import type { StageFrame } from 'components/gameModes/pong/PongTypes';

const { t } = useI18n();

const props = defineProps<{
  state: PongEnded;
}>();

const frame = computed<StageFrame | null>(() => props.state.frame ?? null);

const winnerLabel = computed(() => {
  const f = frame.value;
  if (!f) return '';
  const side =
    f.left.score > f.right.score
      ? t('cast.pong.completed.left')
      : t('cast.pong.completed.right');
  return `${side} ${t('cast.pong.completed.wins')}`;
});
</script>

<style scoped>
.completed-cast {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>
