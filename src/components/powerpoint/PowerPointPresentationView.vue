<template>
  <div class="pp-present">
    <!-- Live cast: the real cast pages, once BuzzMaster is running a game. -->
    <PowerPointCastView
      v-if="showCast"
      class="pp-cast-slot"
      data-testid="pp-cast"
    />

    <!-- Otherwise the pre-game surface: what the element shows before a game
         exists, and whenever BuzzMaster cannot be reached. -->
    <div
      v-else
      class="pp-idle"
    >
      <div
        v-if="!preset"
        class="pp-unconfigured"
        data-testid="pp-unconfigured"
      >
        {{ t('powerpoint.presentation.notConfigured') }}
      </div>

      <template v-else>
        <div
          class="pp-game"
          data-testid="pp-game-title"
        >
          {{ t(`gameMode.${preset.game}.title`) }}
        </div>

        <div
          class="pp-status"
          :class="`pp-status--${state}`"
          data-testid="pp-connection-status"
        >
          {{ statusText }}
        </div>

        <div
          v-if="state === 'disabled'"
          class="pp-howto"
          data-testid="pp-disabled-help"
        >
          {{ t('powerpoint.connection.disabledHelp') }}
        </div>

        <q-btn
          v-if="state === 'connected'"
          :label="
            activation === 'activating'
              ? t('powerpoint.presentation.preparing')
              : t('powerpoint.presentation.prepare')
          "
          :loading="activation === 'activating'"
          color="primary"
          unelevated
          rounded
          data-testid="pp-prepare"
          @click="onPrepare"
        />

        <div
          v-if="activation === 'failed'"
          class="pp-status pp-status--error"
          data-testid="pp-activation-error"
        >
          {{ activationError ?? t('powerpoint.presentation.activationFailed') }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { GamePreset } from '@/../common/gamePreset/GamePreset';
import { useCastStore } from '@/stores/cast-store';
import { usePowerPointConnection } from '@/composables/powerPointConnection';
import PowerPointCastView from '@/components/powerpoint/PowerPointCastView.vue';

const props = defineProps<{
  preset: GamePreset | undefined;
  instanceId?: string | undefined;
}>();

const { t } = useI18n();

/**
 * The cast store is fed straight from the socket, so the cast pages read exactly
 * what they read in the cast window (plan section 21). There is no parallel copy
 * of the state, and therefore no way for the two surfaces to disagree.
 */
const castStore = useCastStore();

const { state, error, activation, activationError, activate } =
  usePowerPointConnection(toRef(props, 'instanceId'), {
    applySnapshot: castStore.applySnapshot,
    updateGameState: castStore.updateGameState,
    updateGameSettings: castStore.updateGameSettings,
    updateControllers: castStore.updateControllers,
    updateLocale: castStore.updateLocale,
  });

/**
 * Show the cast only while genuinely connected.
 *
 * A disconnected add-in still holds the last state it received, and leaving that
 * on screen would present stale information to an audience as though it were
 * live — the same reason `AllowSnapshot` is false (plan section 25.1).
 */
const showCast = computed(
  () => state.value === 'connected' && castStore.gameState !== undefined,
);

function onPrepare() {
  if (props.preset) {
    activate(props.preset);
  }
}

/**
 * Plan section 27: never fail silently. Every connection state gets its own
 * message, including the ones that are nobody's fault.
 */
const statusText = computed(() => {
  switch (state.value) {
    case 'connecting':
      return t('powerpoint.connection.connecting');
    case 'connected':
      return t('powerpoint.connection.connected');
    case 'disabled':
      return t('powerpoint.connection.disabled');
    case 'incompatible':
      return error.value ?? t('powerpoint.connection.incompatible');
    case 'error':
      return error.value ?? t('powerpoint.connection.error');
    case 'disconnected':
    default:
      return t('powerpoint.connection.disconnected');
  }
});
</script>

<style scoped>
.pp-present {
  height: 100%;
  width: 100%;
}

.pp-cast-slot {
  height: 100%;
}

.pp-idle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  padding: 1rem;
  text-align: center;
}

.pp-game {
  font-size: clamp(1.5rem, 7cqw, 3.5rem);
  font-weight: 800;
  letter-spacing: 0.02em;
}

.pp-status,
.pp-unconfigured {
  font-size: clamp(0.75rem, 2.5cqw, 1.1rem);
  opacity: 0.65;
}

.pp-status--connected {
  color: #6ee7a8;
  opacity: 0.9;
}

.pp-status--disabled {
  color: #ffd25c;
  opacity: 0.9;
}

.pp-howto {
  font-size: clamp(0.7rem, 2.2cqw, 0.95rem);
  opacity: 0.7;
  max-width: 28rem;
}

.pp-status--incompatible,
.pp-status--error {
  color: #ff8a8a;
  opacity: 0.9;
}
</style>
