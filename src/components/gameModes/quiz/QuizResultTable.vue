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

<script lang="ts" setup>
import { useGameSettingsStore } from 'stores/game-settings-store';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { computed, ref } from 'vue';
import { buzzerButtonColor } from 'components/buttonColors';

const { quizSettings } = useGameSettingsStore();

const activeResult = ref<BuzzerButton>();
const props = defineProps<{
  answers: Record<string, BuzzerButton>;
  controllerNames: Record<string, string>;
}>();

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

const controllersByButton = computed<Record<BuzzerButton, string[]>>(() => {
  const result: Record<BuzzerButton, string[]> = {
    [BuzzerButton.RED]: [],
    [BuzzerButton.BLUE]: [],
    [BuzzerButton.ORANGE]: [],
    [BuzzerButton.GREEN]: [],
    [BuzzerButton.YELLOW]: [],
  };

  return Object.entries(props.answers).reduce((acc, [controllerId, button]) => {
    acc[button].push(props.controllerNames[controllerId]);
    return acc;
  }, result);
});

const resultOptions = computed<BuzzerButton[]>(() => {
  // Red button as equivalent for not pressed
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
