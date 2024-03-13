<template>
  <template v-if="mode === 'table'">
    <div class="column justify-around q-pr-sm">
      <q-btn
        v-for="button in resultOptions"
        :key="button"
        :label="buttonOccurrences[button]"
        :color="buttonColor[button]"
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
          :items="controllerNames(props.controllersByButton[button])"
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
            :class="buttonBgColor[button]"
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
import { BuzzerButton, IController } from 'src/plugins/buzzer/types';
import { computed } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import { buttonBgColor, buttonColor } from 'components/buttonColors';

const { quizSettings } = useQuestionSettingsStore();
const { controllers } = useBuzzer();

const activeResult = defineModel<BuzzerButton | undefined>();
const props = defineProps<{
  confirmedControllers: string[];
  pressedButtons: Map<string, BuzzerButton>;
  controllersByButton: Record<BuzzerButton, IController[] | undefined>;
}>();

type BuzzerMap = Record<BuzzerButton, number>;

const buttonOccurrences = computed<BuzzerMap>(() => {
  return {
    [BuzzerButton.BLUE]:
      props.controllersByButton[BuzzerButton.BLUE]?.length ?? 0,
    [BuzzerButton.ORANGE]:
      props.controllersByButton[BuzzerButton.ORANGE]?.length ?? 0,
    [BuzzerButton.GREEN]:
      props.controllersByButton[BuzzerButton.GREEN]?.length ?? 0,
    [BuzzerButton.YELLOW]:
      props.controllersByButton[BuzzerButton.YELLOW]?.length ?? 0,
    [BuzzerButton.RED]:
      props.controllersByButton[BuzzerButton.RED]?.length ?? 0,
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

const mode = computed<string>(() => {
  return quizSettings.resultMode;
});

function controllerNames(controllers?: IController[]): string[] {
  return controllers?.map((controller) => controller.name) ?? [];
}
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
