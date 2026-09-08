<template>
  <div class="column justify-around q-pr-sm">
    <q-btn
      v-for="button in resultOptions"
      :key="button"
      :label="buttonOccurrences[button]"
      :color="menuButtonColor(button)"
      class="col-grow q-my-xs text-bold text-h5"
      :class="activeResult === button ? 'col-2' : ''"
      rounded
      :outline="activeResult !== button"
      @click="activeResult = button"
    />
  </div>
  <q-tab-panels
    v-model="activeResult"
    class="col-10 row"
    vertical
    animated
  >
    <q-tab-panel
      v-for="button in resultOptions"
      :key="button"
      :name="button"
      class="col-grow absolute"
    >
      <q-virtual-scroll
        :items="controllersByButton[button]"
        separator
        v-slot="{ item }: { item: ControllerAnswer }"
        style="height: 100%"
      >
        <q-item :key="item.controllerId">
          <q-item-section>
            {{ item.name }}
          </q-item-section>
          <q-item-section
            v-if="item.reactionTime !== undefined"
            side
            class="text-bold"
            data-testid="result-reaction-time"
          >
            {{
              t('gameMode.quiz.result.reactionTime.seconds', {
                n: formatReactionTime(item.reactionTime),
              })
            }}
          </q-item-section>
        </q-item>
      </q-virtual-scroll>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script lang="ts" setup>
import { useGameSettingsStore } from '@/stores/game-settings-store';
import { BuzzerButton } from '@/plugins/buzzer/types';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { buzzerButtonColor } from '@/components/buttonColors';
import {
  type ControllerAnswer,
  groupAnswersByButton,
} from '@/components/gameModes/quiz/answerGroups';
import { formatReactionTime } from '@/components/gameModes/quiz/reactionTimes';

const { t } = useI18n();
const { quizSettings } = useGameSettingsStore();

const props = defineProps<{
  answers: Record<string, BuzzerButton>;
  answerTimes: Record<string, number>;
  controllerNames: Record<string, string>;
}>();

const activeResult = ref<BuzzerButton>(
  quizSettings.activeButtons[0] ?? BuzzerButton.RED,
);

const buttonOccurrences = computed<Record<BuzzerButton, number>>(() => {
  const result: Record<BuzzerButton, number> = {
    [BuzzerButton.RED]: 0,
    [BuzzerButton.BLUE]: 0,
    [BuzzerButton.ORANGE]: 0,
    [BuzzerButton.GREEN]: 0,
    [BuzzerButton.YELLOW]: 0,
  };

  return Object.values(props.answers).reduce((acc, button) => {
    acc[button] += 1;
    return acc;
  }, result);
});

const controllersByButton = computed<Record<BuzzerButton, ControllerAnswer[]>>(
  () =>
    groupAnswersByButton(
      props.answers,
      props.answerTimes,
      props.controllerNames,
      quizSettings.answerTime,
    ),
);

const resultOptions = computed<BuzzerButton[]>(() => {
  // The red button as equivalent for not pressed
  const options =
    buttonOccurrences.value[BuzzerButton.RED] === 0
      ? quizSettings.activeButtons
      : [...quizSettings.activeButtons, BuzzerButton.RED];

  return options.sort();
});

function menuButtonColor(button: BuzzerButton) {
  if (button === BuzzerButton.RED) {
    return 'grey';
  }

  return buzzerButtonColor[button];
}
</script>

<style scoped></style>
