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

              <div
                v-if="playerCount !== null"
                class="meta-item"
              >
                {{ t('cast.simon.players', { n: playerCount }) }}
              </div>

              <div
                v-if="survivorCount !== null"
                class="meta-item"
              >
                {{ t('cast.simon.survivors', { n: survivorCount }) }}
              </div>
            </div>
          </div>
        </transition>
      </header>

      <!-- Main stage: winner hero on gameOver, normal pad layout otherwise -->
      <main class="stage">
        <transition
          name="fade"
          mode="out-in"
        >
          <!-- Game over: winner takes over the entire stage -->
          <div
            v-if="state?.name === 'gameOver'"
            key="gameover"
            class="winner-hero"
          >
            <div class="winner-label">
              {{
                winnerName
                  ? t('cast.simon.callout.winner')
                  : t('cast.simon.callout.gameOver')
              }}
            </div>
            <div
              v-if="winnerName"
              class="winner-name"
            >
              {{ winnerName }}
            </div>
          </div>

          <!-- All other states: pad + info layout -->
          <div
            v-else
            key="playing"
            class="pad-stage"
            :class="{
              'pad-stage--showing': state?.name === 'showing',
              'pad-stage--input': state?.name === 'input',
            }"
          >
            <div class="pad-frame">
              <SimonPad
                :buttons="SIMON_BUTTONS"
                :highlight="highlight"
                :style="PAD_STYLE"
                class="pad"
              />
            </div>

            <!-- Callout: only animates on phase change, not on every button flash -->
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

            <!-- Step counter: updates reactively without animation -->
            <div
              v-if="showingStep !== null"
              class="step-counter"
            >
              {{ showingStep }}
            </div>

            <!-- Countdown timer: derived from startTime + timeLimit, no IPC needed -->
            <div
              v-if="remainingTime !== null"
              class="countdown"
            >
              <timer-animated :time="remainingTime" />
            </div>

            <!-- Anonymous aggregate progress (no individual names) -->
            <div
              v-if="anonymousProgress !== null"
              class="anon-progress"
            >
              <div class="anon-bar">
                <div
                  class="anon-seg anon-seg--done"
                  :style="{ flex: anonymousProgress.done }"
                />
                <div
                  class="anon-seg anon-seg--playing"
                  :style="{ flex: anonymousProgress.playing }"
                />
                <div
                  class="anon-seg anon-seg--out"
                  :style="{ flex: anonymousProgress.out }"
                />
              </div>
              <div class="anon-legend">
                <span
                  v-if="anonymousProgress.done > 0"
                  class="anon-done"
                >
                  {{
                    t('cast.simon.progress.done', { n: anonymousProgress.done })
                  }}
                </span>
                <span
                  v-if="anonymousProgress.out > 0"
                  class="anon-out"
                >
                  {{
                    t('cast.simon.progress.out', { n: anonymousProgress.out })
                  }}
                </span>
              </div>
            </div>
          </div>
        </transition>
      </main>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCastStore } from 'stores/cast-store';
import type { SimonState } from 'app/common/gameState/SimonState';
import SimonPad from 'components/gameModes/SimonPad.vue';
import TimerAnimated from 'components/TimerAnimated.vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';

const { t } = useI18n();
const castStore = useCastStore();

const SIMON_BUTTONS: BuzzerButton[] = [
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];

const PAD_STYLE = {
  '--width': '100%',
  '--bar-h': '72px',
};

const state = computed<SimonState | undefined>(() => {
  return castStore.gameState as SimonState | undefined;
});

// Local clock for countdown — runs only during timed input phases, no IPC needed
const now = ref(Date.now());
let nowInterval: ReturnType<typeof setInterval> | null = null;

watch(
  () => state.value,
  (s) => {
    if (nowInterval) {
      clearInterval(nowInterval);
      nowInterval = null;
    }
    if (s?.name === 'input' && s.timeLimit > 0) {
      nowInterval = setInterval(() => {
        now.value = Date.now();
      }, 100);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (nowInterval) clearInterval(nowInterval);
});

const safeRound = computed(() => {
  return state.value?.round ?? 0;
});

const highlight = computed<BuzzerButton | null>(() => {
  const s = state.value;
  if (!s || s.name !== 'showing' || !s.showing) return null;
  if (s.stepIndex < 0 || s.stepIndex >= s.sequence.length) return null;
  return s.sequence[s.stepIndex] ?? null;
});

const showingStep = computed<string | null>(() => {
  const s = state.value;
  if (!s || s.name !== 'showing') return null;
  const step = s.showing ? s.stepIndex + 1 : s.stepIndex;
  if (step === 0) return null;
  return t('cast.simon.step', { step, total: s.sequence.length });
});

const remainingTime = computed<number | null>(() => {
  const s = state.value;
  if (!s || s.name !== 'input' || s.timeLimit <= 0) return null;
  return Math.max(0, s.timeLimit - (now.value - s.startTime) / 1000);
});

// Anonymous aggregate — no individual names, just counts per status bucket
const anonymousProgress = computed<{
  done: number;
  out: number;
  playing: number;
} | null>(() => {
  const s = state.value;
  if (!s || s.name !== 'input' || s.players.length === 0) return null;
  let done = 0;
  let out = 0;
  for (const id of s.players) {
    const raw = s.inputIndex[id] ?? 0;
    if (raw === s.sequence.length) done++;
    else if (raw === -1) out++;
  }
  return { done, out, playing: s.players.length - done - out };
});

const phaseLabel = computed<string>(() => {
  const s = state.value;
  if (!s) return t('cast.simon.phase.unknown');

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

  // @ts-expect-error: exhaustive
  return '';
});

const phaseClass = computed(() => {
  const s = state.value;
  return s?.name ? `phase--${s.name}` : 'phase--unknown';
});

const calloutText = computed(() => {
  const s = state.value;
  if (!s) return t('cast.simon.callout.waiting');

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

  // @ts-expect-error: exhaustive
  return '';
});

// Show player count only during showing/input — not during roundOver (survivors shown instead)
// and not during gameOver (winner hero shown)
const playerCount = computed<number | null>(() => {
  const s = state.value;
  if (
    !s ||
    s.name === 'preparing' ||
    s.name === 'roundOver' ||
    s.name === 'gameOver'
  )
    return null;
  return s.players.length;
});

const survivorCount = computed<number | null>(() => {
  const s = state.value;
  if (!s || s.name !== 'roundOver') return null;
  return s.survivors.length;
});

const winnerName = computed<string>(() => {
  const s = state.value;
  if (!s || s.name !== 'gameOver' || !s.winner) return '';
  return s.winner;
});

const headerKey = computed(() => {
  return `${state.value?.name ?? 'none'}-${safeRound.value}`;
});

// Fixed: was `${name}-${highlight}` which caused a fade flicker every ~300ms
// during showing phase even though the callout text never changed.
const calloutKey = computed(() => {
  return state.value?.name ?? 'none';
});
</script>

<style scoped>
.cast-page {
  min-height: 100vh;
  /* No background override — inherits from Quasar theme so light mode and
     transparent window mode both work correctly. */
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
  align-items: center;
  gap: 10px;
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
  background: currentColor;
  opacity: 0.55;
}

.phase-text {
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 12px;
  opacity: 0.9;
}

.phase--showing .phase-dot {
  opacity: 1;
  animation: pulse 900ms ease-in-out infinite;
}
.phase--input .phase-dot {
  opacity: 1;
  animation: pulse 1200ms ease-in-out infinite;
}

.meta-item {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.07);
  font-weight: 700;
  font-size: 13px;
  opacity: 0.9;
}

/* Stage */
.stage {
  display: grid;
  place-items: center;
  padding-bottom: 24px;
}

/* Winner hero (gameOver) */
.winner-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  width: 100%;
  min-height: 400px;
  padding: 48px 24px;
}

.winner-label {
  font-size: clamp(14px, 1.8vw, 20px);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.6;
  text-align: center;
}

.winner-name {
  font-size: clamp(56px, 9vw, 120px);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
  text-align: center;
  text-shadow:
    0 0 80px rgba(255, 255, 255, 0.4),
    0 20px 60px rgba(0, 0, 0, 0.7);
  animation: winner-glow 2.5s ease-in-out infinite;
}

@keyframes winner-glow {
  0%,
  100% {
    text-shadow:
      0 0 60px rgba(255, 255, 255, 0.3),
      0 20px 60px rgba(0, 0, 0, 0.7);
  }
  50% {
    text-shadow:
      0 0 100px rgba(255, 255, 255, 0.65),
      0 0 200px rgba(255, 255, 255, 0.15),
      0 20px 60px rgba(0, 0, 0, 0.7);
  }
}

/* Normal pad layout */
.pad-stage {
  width: min(760px, 92vw);
  display: grid;
  place-items: center;
  gap: 18px;
}

.pad-stage--showing .pad-frame {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
}
.pad-stage--input .pad-frame {
  box-shadow: 0 26px 80px rgba(0, 0, 0, 0.5);
}

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
    box-shadow 220ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pad {
  width: 100%;
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

/* Step counter — updates without animation */
.step-counter {
  font-size: clamp(13px, 1.5vw, 18px);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.5;
  text-align: center;
}

/* Countdown */
.countdown {
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 800;
  letter-spacing: 0.06em;
  opacity: 0.9;
  text-align: center;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

/* Anonymous aggregate progress bar */
.anon-progress {
  width: min(420px, 70vw);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anon-bar {
  height: 8px;
  border-radius: 4px;
  background: rgba(128, 128, 128, 0.2);
  overflow: hidden;
  display: flex;
}

.anon-seg {
  transition: flex 200ms ease;
  min-width: 0;
}

.anon-seg--done {
  background: rgba(76, 175, 80, 0.85);
}
.anon-seg--playing {
  background: transparent;
}
.anon-seg--out {
  background: rgba(239, 83, 80, 0.75);
}

.anon-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: clamp(11px, 1.2vw, 14px);
  font-weight: 600;
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.anon-done {
  color: #66bb6a;
}
.anon-out {
  color: #ef5350;
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
  transition: opacity 220ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
