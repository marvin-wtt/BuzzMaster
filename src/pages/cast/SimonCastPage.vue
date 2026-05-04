<template>
  <q-page
    class="cast-page"
    padding
  >
    <div class="cast-wrap">
      <!-- Header -->
      <header class="cast-header">
        <transition
          name="slide-fade"
          mode="out-in"
        >
          <div
            :key="headerKey"
            class="header-inner"
          >
            <div class="round">
              {{ t('cast.simon.round', { round: safeRound }) }}
            </div>

            <div class="meta-row">
              <div
                class="phase-pill"
                :class="phaseClass"
              >
                <span class="phase-dot" />
                <span class="phase-text">{{ phaseLabel }}</span>
              </div>

              <div class="meta">
                <transition
                  name="fade"
                  mode="out-in"
                >
                  <div
                    :key="metaKey"
                    class="meta-inner"
                  >
                    <span
                      v-if="playerCount !== null"
                      class="meta-item"
                    >
                      {{ t('cast.simon.players', { n: playerCount }) }}
                    </span>
                    <span
                      v-if="survivorCount !== null"
                      class="meta-item"
                    >
                      {{ t('cast.simon.survivors', { n: survivorCount }) }}
                    </span>
                    <span
                      v-if="winnerName"
                      class="meta-item meta-winner"
                    >
                      {{ t('cast.simon.winner', { name: winnerName }) }}
                    </span>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </transition>
      </header>

      <!-- Main stage -->
      <main class="stage">
        <div
          class="pad-stage"
          :class="{
            'pad-stage--showing': state?.name === 'showing',
            'pad-stage--input': state?.name === 'input',
            'pad-stage--gameover': state?.name === 'gameOver',
          }"
        >
          <div class="pad-frame">
            <SimonPad
              :buttons="SIMON_BUTTONS"
              :highlight="highlight"
              class="pad"
            />
          </div>

          <!-- big callout text -->
          <transition
            name="fade"
            mode="out-in"
          >
            <div
              :key="calloutKey"
              class="callout"
            >
              {{ calloutText }}
            </div>
          </transition>
        </div>
      </main>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastStore } from 'stores/cast-store';
import type { SimonState } from 'app/common/gameState/SimonState';
import SimonPad from 'components/gameModes/SimonPad.vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';

const { t } = useI18n();
const castStore = useCastStore();

const SIMON_BUTTONS: BuzzerButton[] = [
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];

const state = computed<SimonState | undefined>(() => {
  return castStore.gameState as SimonState | undefined;
});

const safeRound = computed(() => {
  return state.value?.round ?? 0;
});

const highlight = computed<BuzzerButton | null>(() => {
  const s = state.value;
  if (!s || s.name !== 'showing') {
    return null;
  }

  const idx = s.stepIndex;
  if (!s.showing) {
    return null;
  }
  if (idx < 0 || idx >= s.sequence.length) {
    return null;
  }

  return s.sequence[idx] ?? null;
});

const phaseLabel = computed<string>(() => {
  const s = state.value;
  if (!s) {
    return t('cast.simon.phase.unknown');
  }

  switch (s.name) {
    case 'preparing':
      return t('cast.simon.phase.preparing');
    case 'showing':
      return t('cast.simon.phase.showing');
    case 'input':
      return t('cast.simon.phase.input');
    case 'roundOver':
      return t('cast.simon.phase.roundOver');
    case 'gameOver':
      return t('cast.simon.phase.gameOver');
  }

  // @ts-expect-error: this should never happen, but TS doesn't know that'
  return '';
});

const phaseClass = computed(() => {
  const s = state.value;
  return s?.name ? `phase--${s.name}` : 'phase--unknown';
});

const calloutText = computed(() => {
  const s = state.value;
  if (!s) {
    return t('cast.simon.callout.waiting');
  }

  switch (s.name) {
    case 'preparing':
      return t('cast.simon.callout.preparing');
    case 'showing':
      return t('cast.simon.callout.showing');
    case 'input':
      return t('cast.simon.callout.input');
    case 'roundOver':
      return t('cast.simon.callout.roundOver');
    case 'gameOver':
      return s.winner
        ? t('cast.simon.callout.winner')
        : t('cast.simon.callout.gameOver');
  }

  // @ts-expect-error: this should never happen, but TS doesn't know that'
  return '';
});

const playerCount = computed<number | null>(() => {
  const s = state.value;
  if (!s) {
    return null;
  }

  if (s.name === 'gameOver') {
    return 1;
  }

  return s.players.length;
});

const survivorCount = computed<number | null>(() => {
  const s = state.value;
  if (!s) {
    return null;
  }

  if (s.name === 'roundOver') {
    return s.survivors.length;
  }

  return null;
});

const winnerName = computed<string>(() => {
  const s = state.value;
  if (!s || s.name !== 'gameOver' || !s.winner) {
    return '';
  }
  // If you have a controller name mapping in cast store, swap this:
  return s.winner;
});

const headerKey = computed(() => {
  return `${state.value?.name ?? 'none'}-${safeRound.value}`;
});

const metaKey = computed(() => {
  return `${playerCount.value ?? 'x'}-${survivorCount.value ?? 'x'}-${winnerName.value ?? ''}`;
});

const calloutKey = computed(() => {
  return `${state.value?.name ?? 'none'}-${highlight.value ?? 'none'}`;
});
</script>

<style scoped>
/* Full-screen cast look */
.cast-page {
  min-height: 100vh;
  background:
    radial-gradient(
      1200px 700px at 25% 20%,
      rgba(255, 255, 255, 0.06),
      transparent 60%
    ),
    radial-gradient(
      1000px 600px at 80% 30%,
      rgba(255, 255, 255, 0.05),
      transparent 55%
    ),
    linear-gradient(180deg, #07080b 0%, #0b0c12 55%, #07080b 100%);
  color: rgba(255, 255, 255, 0.92);
}

.cast-wrap {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 28px;
}

/* Header */
.cast-header {
  padding-top: 8px;
}

.header-inner {
  display: grid;
  gap: 14px;
}

.round {
  font-weight: 800;
  font-size: clamp(34px, 4.5vw, 64px);
  letter-spacing: 0.02em;
  text-align: center;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.meta-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.phase-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 14px 40px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

.phase-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.05);
}

.phase-text {
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.9;
}

/* Phase accents (no fixed colors, just intensity) */
.phase--showing .phase-dot {
  opacity: 1;
  animation: pulse 900ms ease-in-out infinite;
}
.phase--input .phase-dot {
  opacity: 1;
  animation: pulse 1200ms ease-in-out infinite;
}
.phase--gameOver .phase-dot {
  opacity: 1;
}

/* Meta */
.meta {
  display: inline-flex;
  align-items: center;
}

.meta-inner {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.meta-item {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.07);
  font-weight: 700;
  font-size: 13px;
  opacity: 0.9;
}

.meta-winner {
  opacity: 1;
  background: rgba(255, 255, 255, 0.07);
}

/* Stage */
.stage {
  display: grid;
  place-items: center;
  padding-bottom: 24px;
}

.pad-stage {
  width: min(760px, 92vw);
  display: grid;
  place-items: center;
  gap: 18px;
}

/* slightly different “mood” by state */
.pad-stage--showing .pad-frame {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
}
.pad-stage--input .pad-frame {
  box-shadow: 0 26px 80px rgba(0, 0, 0, 0.5);
}
.pad-stage--gameover .pad-frame {
  filter: saturate(0.95) brightness(0.95);
}

/* Frame around the pad, to look premium on cast */
.pad-frame {
  width: min(420px, 70vw);
  aspect-ratio: 1 / 1;
  border-radius: 28px;
  padding: 18px;
  background:
    radial-gradient(
      circle at 30% 20%,
      rgba(255, 255, 255, 0.08),
      transparent 60%
    ),
    rgba(255, 255, 255, 0.04);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 24px 80px rgba(0, 0, 0, 0.45);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    filter 220ms ease;
}

.pad {
  width: 100%;
  height: 100%;
}

/* Callout */
.callout {
  font-size: clamp(18px, 2.2vw, 26px);
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.92;
  text-align: center;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
}

/* Animations */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.05);
  }
  50% {
    transform: scale(1.12);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.07);
  }
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
