<template>
  <teleport to="#navbar-action">
    <q-btn
      v-if="visible"
      :color="active ? 'warning' : undefined"
      :aria-label="label"
      icon="speed"
      size="md"
      rounded
      flat
      dense
      data-testid="btn-reaction-times"
      @click="toggleReactionTimes"
    >
      <q-tooltip>
        {{ label }}
      </q-tooltip>
    </q-btn>
  </teleport>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useGameSettingsStore } from '@/stores/game-settings-store';
import { useCastWindowStore } from '@/stores/cast-window-store';

const { t } = useI18n();
const { quizSettings } = storeToRefs(useGameSettingsStore());
const { open } = storeToRefs(useCastWindowStore());

// The setting only changes the cast, so it is pointless without a cast window.
// Reaction times also rank the players against each other, which the anonymous
// survey mode deliberately does not do.
const visible = computed<boolean>(
  () => open.value && quizSettings.value.mode !== 'survey',
);

const active = computed<boolean>(() => quizSettings.value.showReactionTimes);

// The tooltip names what the click does, not the current state
const label = computed<string>(() =>
  active.value
    ? t('gameMode.quiz.action.reactionTimes.hide')
    : t('gameMode.quiz.action.reactionTimes.show'),
);

const toggleReactionTimes = () => {
  quizSettings.value.showReactionTimes = !quizSettings.value.showReactionTimes;
};
</script>

<style scoped></style>
