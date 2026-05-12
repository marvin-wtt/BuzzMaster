<template>
  <q-page
    v-if="state"
    class="cast-page"
  >
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

    <main class="stage">
      <transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="state.name === 'gameOver'"
          key="gameover"
          class="winner-hero"
        >
          <div class="winner-label text-center">
            {{
              winnerName
                ? t('cast.simon.callout.winner')
                : t('cast.simon.callout.gameOver')
            }}
          </div>
          <div
            v-if="winnerName"
            class="winner-name text-center"
          >
            {{ winnerName }}
          </div>
          <div
            v-if="eliminationHistogram.length > 0"
            class="histogram"
          >
            <div
              v-for="(bar, index) in eliminationHistogram"
              :key="bar.round"
              class="hist-row"
              :style="{ '--i': index }"
            >
              <span class="hist-label">
                {{ t('cast.simon.round', { round: bar.round }) }}
              </span>
              <div class="hist-track">
                <div
                  class="hist-bar"
                  :class="{
                    'hist-bar--primary':
                      index === eliminationHistogram.length - 1,
                  }"
                  :style="{ '--pct': bar.pct }"
                />
              </div>
              <span class="hist-pts">+{{ bar.points }}</span>
            </div>
          </div>
        </div>

        <div
          v-else
          key="playing"
          class="pad-stage"
          :class="{
            'pad-stage--showing': state.name === 'showing',
            'pad-stage--input': state.name === 'input',
          }"
        >
          <div class="pad-frame">
            <SimonPad
              :buttons="SIMON_BUTTONS"
              :highlight="highlight"
              :style="{
                '--width': '100%',
                '--bar-h': '72px',
              }"
              class="pad"
            />
          </div>

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

          <div
            v-if="showingStep !== null"
            class="step-counter"
          >
            {{ showingStep }}
          </div>

          <div
            v-if="remainingTime !== null"
            class="countdown"
          >
            <timer-animated :time="remainingTime" />
          </div>

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
                {{ t('cast.simon.progress.out', { n: anonymousProgress.out }) }}
              </span>
            </div>
          </div>
        </div>
      </transition>
    </main>
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

const state = computed<SimonState | undefined>(() => {
  return castStore.gameState as SimonState | undefined;
});

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
  if (nowInterval) {
    clearInterval(nowInterval);
  }
});

const safeRound = computed(() => state.value?.round ?? 0);

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
    if (raw === s.sequence.length) {
      done++;
    } else if (raw === -1) {
      out++;
    }
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

const playerCount = computed<number | null>(() => {
  const s = state.value;
  if (
    !s ||
    s.name === 'preparing' ||
    s.name === 'roundOver' ||
    s.name === 'gameOver'
  ) {
    return null;
  }
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

const winnerPoints = computed(
  () => castStore.gameSettings.simon?.winnerPoints ?? 0,
);

const eliminationHistogram = computed(() => {
  const s = state.value;
  if (!s || s.name !== 'gameOver' || winnerPoints.value <= 0) return [];

  const wp = winnerPoints.value;
  const totalRounds = s.round;
  const hasWinner = s.winner !== undefined;

  const countByRound: Record<number, number> = {};
  for (const round of Object.values(s.eliminatedAt)) {
    countByRound[round] = (countByRound[round] ?? 0) + 1;
  }

  const rounds = Object.keys(countByRound)
    .map(Number)
    .sort((a, b) => a - b);

  if (rounds.length === 0) return [];

  const pointsForRound = (round: number): number =>
    !hasWinner && round === totalRounds
      ? wp
      : Math.floor((wp * (round - 1)) / totalRounds);

  const maxPts = Math.max(...rounds.map(pointsForRound));

  return rounds.map((round) => {
    const pts = pointsForRound(round);
    return {
      round,
      count: countByRound[round]!,
      points: pts,
      pct: maxPts > 0 ? pts / maxPts : 0,
      isPeak: pts === maxPts,
    };
  });
});

const headerKey = computed(
  () => `${state.value?.name ?? 'none'}-${safeRound.value}`,
);

// Keyed only on phase name — not on highlight — to avoid flicker every ~300ms during showing
const calloutKey = computed(() => state.value?.name ?? 'none');
</script>

<style scoped>
.cast-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cast-header {
  padding: clamp(6px, 1.2vh, 16px) clamp(16px, 3vw, 40px);
  flex-shrink: 0;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  gap: 10px;
}

.round {
  font-weight: 800;
  font-size: clamp(22px, 4.5vw, 64px);
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
  gap: 8px;
  padding: clamp(6px, 0.8vh, 10px) 12px;
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

.stage {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 0;
  overflow: hidden;
  padding: clamp(10px, 2vh, 28px) clamp(16px, 3vw, 40px);
}

.winner-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: clamp(10px, 2.5vh, 24px);
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: clamp(16px, 3vh, 40px) 16px;
}

.winner-label {
  font-size: clamp(12px, 1.8vw, 20px);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.6;
}

.winner-name {
  font-size: clamp(32px, 7vw, 100px);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
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

.callout {
  font-size: clamp(18px, 2.2vw, 26px);
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.92;
  text-align: center;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
}

.step-counter {
  font-size: clamp(13px, 1.5vw, 18px);
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.5;
  text-align: center;
}

.countdown {
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 800;
  letter-spacing: 0.06em;
  opacity: 0.9;
  text-align: center;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

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

.histogram {
  display: flex;
  flex-direction: column;
  gap: clamp(5px, 1vh, 10px);
  width: min(520px, 88vw);
  margin-top: clamp(16px, 4vh, 48px);
  min-height: 0;
  flex-shrink: 1;
  overflow: hidden;
}

.hist-row {
  display: grid;
  grid-template-columns: 6ch 1fr auto;
  align-items: center;
  gap: 10px;
  opacity: 0;
  animation: hist-row-in 350ms ease forwards;
  animation-delay: calc(var(--i) * 70ms + 100ms);
}

.hist-label {
  font-size: clamp(10px, 1.2vw, 14px);
  font-weight: 600;
  opacity: 0.55;
  white-space: nowrap;
  text-align: right;
}

.hist-track {
  height: clamp(16px, 2.2vh, 26px);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.hist-bar {
  height: 100%;
  width: 0;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 4px;
  animation: grow-bar 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--i) * 70ms + 280ms);
}

.hist-bar--primary {
  background: var(--q-primary);
  box-shadow: 0 0 16px color-mix(in srgb, var(--q-primary) 50%, transparent);
}

.hist-pts {
  font-size: clamp(10px, 1.2vw, 14px);
  font-weight: 700;
  opacity: 0.75;
  white-space: nowrap;
}

@keyframes grow-bar {
  from {
    width: 0;
  }
  to {
    width: calc(var(--pct) * 100%);
  }
}

@keyframes hist-row-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.08);
  }
  50% {
    transform: scale(1.12);
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.12);
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
