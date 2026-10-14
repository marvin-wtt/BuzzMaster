<template>
  <BuzzerSettingsForm
    v-if="preset.game === 'buzzer'"
    ref="settingsForm"
    v-model="preset.settings"
  />
  <QuizSettingsForm
    v-else-if="preset.game === 'quiz'"
    ref="settingsForm"
    v-model="preset.settings"
  />
  <SimonSettingsForm
    v-else-if="preset.game === 'simon'"
    ref="settingsForm"
    v-model="preset.settings"
  />
  <StopwatchSettingsForm
    v-else-if="preset.game === 'stopwatch'"
    ref="settingsForm"
    v-model="preset.settings"
  />
  <PongSettingsForm
    v-else-if="preset.game === 'pong'"
    ref="settingsForm"
    v-model="preset.settings"
  />
</template>

<script lang="ts" setup>
import { useTemplateRef, watch } from 'vue';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';
import type { SettingsFormApi } from '@/components/gameModes/settingsForm';
import BuzzerSettingsForm from '@/components/gameModes/buzzer/BuzzerSettingsForm.vue';
import QuizSettingsForm from '@/components/gameModes/quiz/QuizSettingsForm.vue';
import SimonSettingsForm from '@/components/gameModes/simon/SimonSettingsForm.vue';
import StopwatchSettingsForm from '@/components/gameModes/stopwatch/StopwatchSettingsForm.vue';
import PongSettingsForm from '@/components/gameModes/pong/PongSettingsForm.vue';

/**
 * Renders the settings form for whichever game a PowerPoint element is
 * configured for — the *same* components the desktop dialogs use (plan §13).
 *
 * Sharing the components rather than the markup is the point: a field added for
 * the desktop app appears here automatically, and the two can never disagree
 * about validation rules or defaults.
 *
 * The `v-if` chain rather than a dynamic `<component :is>` is deliberate: it is
 * what narrows `GamePreset` so each form receives its own settings type. A
 * dynamic component would need a cast and would lose that safety, which is
 * exactly what stops a quiz form being handed pong settings.
 */
const preset = defineModel<GamePreset>({ required: true });

const emit = defineEmits<{ change: [] }>();

const settingsForm = useTemplateRef<SettingsFormApi>('settingsForm');

// The forms mutate their model in place, as `v-model` on a field does. A deep
// watch is therefore how edits are observed, and the add-in persists on it.
watch(
  () => preset.value.settings,
  () => emit('change'),
  { deep: true },
);

defineExpose<SettingsFormApi>({
  validate: () => settingsForm.value?.validate() ?? Promise.resolve(true),
  normalize: () => settingsForm.value?.normalize(),
});
</script>
