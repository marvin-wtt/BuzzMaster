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

<script lang="ts" setup>
import { useGameSettingsStore } from 'stores/game-settings-store';
import { BuzzerButton, IController } from 'src/plugins/buzzer/types';
import { computed, ref } from 'vue';
import { buzzerButtonColor } from 'components/buttonColors';

const { quizSettings } = useGameSettingsStore();

const activeResult = ref<BuzzerButton>();
const props = defineProps<{
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

const resultOptions = computed<BuzzerButton[]>(() => {
  // Red button as equivalent for not pressed
  const options =
    buttonOccurrences.value[BuzzerButton.RED] === 0
      ? quizSettings.activeButtons
      : [...quizSettings.activeButtons, BuzzerButton.RED];

  return options.sort();
});

function controllerNames(controllers?: IController[]): string[] {
  return controllers?.map((controller) => controller.name) ?? [];
}

function menuButtonColor(button: BuzzerButton) {
  if (button === BuzzerButton.RED) {
    return 'grey';
  }

  return buzzerButtonColor[button];
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
</style>
