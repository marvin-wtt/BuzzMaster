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
          {{ buttonsByResult[button]?.length ?? 0 }}
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
  <template v-if="mode === 'bars'">
    <div class="bar-chart-container flex">
      <div
        v-for="button in resultOptions"
        :key="button"
        class="bar"
        :style="{
          height: `${barHeightPercentages[button]}%`,
          backgroundColor: resultItemClass[button],
        }"
      />
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
  modelValue: BuzzerButton;
  confirmedControllers: string[];
  pressedButtons: Map<string, BuzzerButton>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: BuzzerButton): void;
}>();

const activeResult = computed<BuzzerButton>({
  get() {
    return props.modelValue;
  },
  set(value: BuzzerButton) {
    emit('update:modelValue', value);
  },
});

type BuzzerMap = Record<BuzzerButton, number>;
const barHeightPercentages = computed<BuzzerMap>(() => {
  const buttonOccurrences: BuzzerMap = {} as BuzzerMap;

  props.pressedButtons.forEach((button) => {
    buttonOccurrences[button] = (buttonOccurrences[button] || 0) + 1;
  });

  const max = Math.max(...Object.values(buttonOccurrences));
  const buttonPercentage: Record<BuzzerButton, number> = {} as BuzzerMap;
  Object.keys(BuzzerButton).map((value) => {
    const button = BuzzerButton[value as keyof typeof BuzzerButton];
    buttonPercentage[button] = buttonOccurrences[button] / max;
  });

  return buttonPercentage;
});

const resultOptions = computed<BuzzerButton[]>(() => {
  // Red button as equivalent for not pressed
  return [...quizSettings.activeButtons, BuzzerButton.RED];
});

const buttonsByResult = computed(() => {
  return controllers.value.reduce((acc, controller) => {
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
  }, {} as Record<BuzzerButton, string[]>);
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
.bar {
  width: 50px;
  margin: 0 10px;
  border-radius: 5px;
}

.bar-chart-container {
  transition: height 1s;
}
</style>
