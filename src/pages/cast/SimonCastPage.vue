<template>
  <q-page
    class="row justify-center"
    padding
  >
    <div>
      <div class="text-center text-h3">
        {{ t('cast.simon.round', { round: state.round }) }}
      </div>

      <simon-pad
        v-if="state.name === 'showing'"
        :buttons="SIMON_BUTTONS"
        :highlight="state.showing ? state.sequence[state.stepIndex] : null"
      />

      <simon-pad
        v-else
        :buttons="SIMON_BUTTONS"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { computed } from 'vue';
import type { SimonState } from 'app/common/gameState/SimonState';
import SimonPad from 'components/gameModes/SimonPad.vue';
import { BuzzerButton } from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';

const SIMON_BUTTONS: BuzzerButton[] = [
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];

const castStore = useCastStore();
const { t } = useI18n();

const state = computed<SimonState>(() => {
  return castStore.gameState as SimonState;
});
</script>

<style scoped></style>
