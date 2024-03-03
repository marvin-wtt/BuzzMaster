<template>
  <template v-if="mode === 'table'">
    <q-tabs
      v-model="activeResult"
      class="col-shrink"
      dense
    >
      <q-tab
        v-for="button in resultOptions"
        :key="button"
        :name="button"
        :class="resultItemClass[button]"
      >
        <div
          :class="
            activeResult === button
              ? 'result-tab-active-content'
              : 'result-tab-content'
          "
        >
          {{ buttonOccurrences[button] }}
        </div>
      </q-tab>
    </q-tabs>
    <q-tab-panels
      v-model="activeResult"
      class="col-grow column"
      animated
    >
      <q-tab-panel
        v-for="button in resultOptions"
        :key="button"
        :name="button"
        class="col-grow absolute"
      >
        <q-virtual-scroll
          :items="buttonsByResult[button]"
          separator
          v-slot="{ item }"
          style="height: 100%"
        >
          <q-item>
            <q-item-section>
              {{ item }}
            </q-item-section>
          </q-item>
        </q-virtual-scroll>
      </q-tab-panel>
    </q-tab-panels>
  </template>
  <template v-else-if="mode === 'bar'">
    <div class="bar-chart-container col-grow row q-pb-sm">
      <div class="column justify-between reverse q-py-md text-grey">
        <div>0 %</div>
        <div>25 %</div>
        <div>50 %</div>
        <div>75 %</div>
        <div>100 %</div>
      </div>
      <div
        v-for="button in resultOptions"
        :key="button"
        class="column justify-between no-wrap text-center"
      >
        <div class="q-pb-sm">{{ buttonPercentage[button] }} %</div>

        <div class="col-grow column justify-end">
          <div
            class="bar text-center"
            :class="resultItemClass[button]"
            :style="{
              height: `${barHeightPercentages[button]}%`,
            }"
          />
        </div>
        <div>
          {{ buttonOccurrences[button] }}
        </div>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { computed } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';

const { quizSettings } = useQuestionSettingsStore();
const { controllers } = useBuzzer();

interface Props {
  modelValue: BuzzerButton | undefined;
  confirmedControllers: string[];
  pressedButtons: Map<string, BuzzerButton>;
}

const props = defineProps<Props>();

const activeResult = defineModel<BuzzerButton>();

type BuzzerMap = Record<BuzzerButton, number>;

const buttonOccurrences = computed<BuzzerMap>(() => {
  return {
    [BuzzerButton.BLUE]: buttonsByResult.value[BuzzerButton.BLUE]?.length ?? 0,
    [BuzzerButton.ORANGE]:
      buttonsByResult.value[BuzzerButton.ORANGE]?.length ?? 0,
    [BuzzerButton.GREEN]:
      buttonsByResult.value[BuzzerButton.GREEN]?.length ?? 0,
    [BuzzerButton.YELLOW]:
      buttonsByResult.value[BuzzerButton.YELLOW]?.length ?? 0,
    [BuzzerButton.RED]: buttonsByResult.value[BuzzerButton.RED]?.length ?? 0,
  };
});

const buttonPercentage = computed<BuzzerMap>(() => {
  const total = controllers.value.length;
  const buttonPercentage: Record<BuzzerButton, number> = {} as BuzzerMap;
  Object.keys(BuzzerButton).map((value) => {
    const button = BuzzerButton[value as keyof typeof BuzzerButton];
    const val = (buttonOccurrences.value[button] / total) * 100;
    buttonPercentage[button] = Math.round(val * 10) / 10;
  });

  return buttonPercentage;
});

const barHeightPercentages = computed<BuzzerMap>(() => {
  const total = controllers.value.length;
  const buttonPercentage: Record<BuzzerButton, number> = {} as BuzzerMap;
  Object.keys(BuzzerButton).map((value) => {
    const button = BuzzerButton[value as keyof typeof BuzzerButton];
    const oVal = buttonOccurrences.value[button];
    const val = oVal === 0 ? 0.01 : oVal;
    buttonPercentage[button] = (val / total) * 100;
  });

  return buttonPercentage;
});

const resultOptions = computed<BuzzerButton[]>(() => {
  // Red button as equivalent for not pressed
  return buttonOccurrences.value[BuzzerButton.RED] === 0
    ? quizSettings.activeButtons
    : [...quizSettings.activeButtons, BuzzerButton.RED];
});

const buttonsByResult = computed(() => {
  return controllers.value.reduce(
    (acc, controller) => {
      const hasConfirmed =
        quizSettings.changeMode === 'always' ||
        props.confirmedControllers.includes(controller.id);
      // Mo input is default button
      const pressedButton =
        props.pressedButtons.get(controller.id) ?? BuzzerButton.RED;
      // Ignore input if user has not confirmed the button selection
      const button = hasConfirmed ? pressedButton : BuzzerButton.RED;

      acc[button] ??= [];
      acc[button].push(controller.name);

      return acc;
    },
    {} as Record<BuzzerButton, string[]>,
  );
});

const mode = computed<string>(() => {
  return quizSettings.resultMode;
});

const resultItemClass = {
  [BuzzerButton.BLUE]: 'bg-blue',
  [BuzzerButton.ORANGE]: 'bg-orange',
  [BuzzerButton.GREEN]: 'bg-green',
  [BuzzerButton.YELLOW]: 'bg-yellow',
  [BuzzerButton.RED]: 'bg-grey',
};
</script>

<style scoped>
.result-tab-content {
  background-color: black;
  color: white;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
}

.result-tab-active-content {
  background-color: white;
  color: black;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
}

.bar {
  width: 50px;
  margin: 0 10px;
  border-radius: 5px;
}

.bar-chart-container {
  transition: height 10s;
}
</style>
