<template>
  <div class="row no-wrap q-col-gutter-x-sm">
    <div class="col">
      <q-btn
        class="full-width"
        color="positive"
        no-caps
        unelevated
        :outline="answerCorrect !== true"
        data-testid="btn-answer-correct"
        @click="onAnswerChange(true)"
      >
        <q-icon
          name="check"
          size="18px"
          class="q-mr-xs"
        />
        {{ t('gameMode.buzzer.action.correct') }}
        <span class="bm-num text-weight-bold q-ml-sm">
          {{ n(buzzerSettings.pointsCorrect, { signDisplay: 'exceptZero' }) }}
        </span>
      </q-btn>
    </div>

    <div class="col">
      <q-btn
        class="full-width"
        color="negative"
        no-caps
        unelevated
        :outline="answerCorrect !== false"
        data-testid="btn-answer-wrong"
        @click="onAnswerChange(false)"
      >
        <q-icon
          name="clear"
          size="18px"
          class="q-mr-xs"
        />
        {{ t('gameMode.buzzer.action.wrong') }}
        <span class="bm-num text-weight-bold q-ml-sm">
          {{ n(buzzerSettings.pointsWrong, { signDisplay: 'exceptZero' }) }}
        </span>
      </q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLeaderboardStore } from 'stores/leaderboard-store';
import { useGameSettingsStore } from 'stores/game-settings-store';
import type { IController } from 'src/plugins/buzzer/types';
import { useAudio } from 'src/composables/audio';

const { t, n } = useI18n();
const leaderboardStore = useLeaderboardStore();
const { buzzerSettings } = useGameSettingsStore();
const { createAudio } = useAudio();

const props = defineProps<{
  controller: IController;
}>();

const emit = defineEmits<{
  (e: 'update', correct: boolean | undefined, points: number | undefined): void;
}>();

const audioCorrect = createAudio('sounds/answer-correct.mp3');
const audioWrong = createAudio('sounds/answer-wrong.mp3');

onBeforeMount(() => {
  audioCorrect.load();
  audioWrong.load();
});

const answerCorrect = ref<boolean>();

const onAnswerChange = async (answer: boolean) => {
  const points = answer
    ? buzzerSettings.pointsCorrect
    : buzzerSettings.pointsWrong;

  // Take back points if button is pressed again
  if (answerCorrect.value === answer) {
    answerCorrect.value = undefined;
    updateLeaderboard(points * -1);
    emit('update', undefined, undefined);
    return;
  }

  // Take back positive points if selection was switched
  if (answerCorrect.value !== undefined) {
    const refundPoints = answer
      ? buzzerSettings.pointsWrong
      : buzzerSettings.pointsCorrect;
    updateLeaderboard(refundPoints * -1);
  }

  answerCorrect.value = answer;
  updateLeaderboard(points);
  emit('update', answer, points);

  await playAudio(answer);
};

const playAudio = async (answer: boolean) => {
  if (answer) {
    await audioCorrect.play();
  } else {
    await audioWrong.play();
  }
};

const updateLeaderboard = (points: number) => {
  leaderboardStore.addPoints(props.controller.id, points);
};
</script>
