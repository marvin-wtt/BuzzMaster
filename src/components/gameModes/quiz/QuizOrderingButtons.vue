<template>
  <div
    class="row justify-center q-gutter-sm"
    data-testid="ordering-correct-selector"
  >
    <q-btn
      v-for="button in quizSettings.activeButtons"
      :key="button"
      :color="buzzerButtonColor[button]"
      :label="selectionNumber(button)"
      size="sm"
      round
      style="border-width: 20px"
      :outline="!selection.includes(button)"
      :data-testid="`ordering-correct-${button}`"
      @click="selectButton(button)"
    />
    <q-btn
      icon="restart_alt"
      size="sm"
      round
      outline
      :disable="selection.length === 0"
      :aria-label="t('gameMode.quiz.ordering.resetCorrectOrder')"
      data-testid="ordering-correct-reset"
      @click="reset"
    >
      <q-tooltip>
        {{ t('gameMode.quiz.ordering.resetCorrectOrder') }}
      </q-tooltip>
    </q-btn>
  </div>
</template>

<script lang="ts" setup>
import { buzzerButtonColor } from 'components/buttonColors';
import type { BuzzerButton } from 'src/plugins/buzzer/types';
import { useGameSettingsStore } from 'stores/game-settings-store';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { quizSettings } = useGameSettingsStore();
const { t } = useI18n();
const pending = ref<BuzzerButton[]>([]);

const props = defineProps<{
  correct?: BuzzerButton[] | undefined;
}>();

const emit = defineEmits<{
  (e: 'update', correct: BuzzerButton[] | undefined): void;
}>();

const selection = computed<BuzzerButton[]>(() => {
  return props.correct ?? pending.value;
});

const selectButton = (button: BuzzerButton): void => {
  if (props.correct !== undefined) {
    return;
  }

  if (pending.value.includes(button)) {
    pending.value = pending.value.filter((value) => value !== button);
    return;
  }

  pending.value = [...pending.value, button];

  if (pending.value.length === quizSettings.activeButtons.length) {
    emit('update', [...pending.value]);
  }
};

const reset = (): void => {
  pending.value = [];
  emit('update', undefined);
};

const selectionNumber = (button: BuzzerButton): string | undefined => {
  const index = selection.value.indexOf(button);
  return index === -1 ? undefined : String(index + 1);
};
</script>

<style scoped></style>
