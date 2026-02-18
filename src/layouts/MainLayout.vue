<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-bar class="q-electron-drag bg-primary">
        <q-btn
          dense
          flat
          no-caps
          no-wrap
          rounded
          @click="goToHome"
        >
          <div class="row q-gutter-sm">
            <q-icon name="cast" />
            <div class="text-body2 gt-xs">
              {{ t('app_name') }}
            </div>
          </div>
        </q-btn>

        <q-separator
          class="lt-sm"
          vertical
          spaced
          inset
        />

        <q-space />

        <transition-group
          name="list"
          type="animation"
        >
          <q-btn
            :aria-label="t('toolbar.leaderboard')"
            key="leaderboard"
            dense
            flat
            rounded
            icon="emoji_events"
            @click="showLeaderboard"
          >
            <q-tooltip>
              {{ t('toolbar.leaderboard') }}
            </q-tooltip>
          </q-btn>

          <q-btn
            v-if="quasar.platform.is.electron"
            :aria-label="t('toolbar.cast')"
            key="cast"
            dense
            flat
            rounded
            size="sm"
            class="settings-button bg-primary"
            icon="cast"
            @click="toggleCast"
          >
            <q-tooltip>
              {{ t('toolbar.cast') }}
            </q-tooltip>
          </q-btn>

          <!-- Settings -->
          <div
            v-if="expandSettings"
            key="settings"
            class="settings-container bg-white row no-wrap"
          >
            <!-- Pin -->
            <q-btn
              v-if="quasar.platform.is.electron"
              :aria-label="pinned ? t('toolbar.unpin') : t('toolbar.pin')"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="pinned ? 'lock_open' : 'push_pin'"
              @click="togglePin"
            >
              <q-tooltip>
                {{ pinned ? t('toolbar.unpin') : t('toolbar.pin') }}
              </q-tooltip>
            </q-btn>

            <!-- Dev tools -->
            <q-btn
              v-if="devMode && quasar.platform.is.electron"
              aria-label="DevTools"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              icon="developer_mode"
              @click="openDevTools"
            />

            <!-- Battery Saving -->
            <q-btn
              :aria-label="t('toolbar.batterySaving')"
              dense
              flat
              rounded
              size="sm"
              key="battery-saving"
              icon="battery_saver"
              class="settings-button bg-primary"
              @click="showBatterySavingDialog"
            >
              <q-tooltip>
                {{ t('toolbar.batterySaving') }}
              </q-tooltip>
            </q-btn>

            <!-- Dark mode -->
            <q-btn
              :aria-label="t('toolbar.darkMode')"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="darkMode ? 'light_mode' : 'dark_mode'"
              @click="toggleDarkMode"
            >
              <q-tooltip>
                {{ t('toolbar.darkMode') }}
              </q-tooltip>
            </q-btn>

            <!-- Change locale -->
            <q-btn
              v-if="supportedLanguages.length > 1"
              :aria-label="t('toolbar.language')"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              icon="language"
            >
              <q-menu
                anchor="bottom middle"
                self="top middle"
              >
                <q-list>
                  <q-item
                    v-for="lang in supportedLanguages"
                    :key="lang.value"
                    clickable
                    v-close-popup
                    @click="updateLocale(lang.value)"
                  >
                    <q-item-section>{{ lang.label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <!-- Mute -->
            <q-btn
              :aria-label="muted ? t('toolbar.unmute') : t('toolbar.mute')"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="volumeIcon"
            >
              <q-tooltip>
                {{ muted ? t('toolbar.unmute') : t('toolbar.mute') }}
              </q-tooltip>

              <q-menu
                anchor="bottom middle"
                self="top middle"
              >
                <q-item style="min-width: 150px">
                  <q-item-section side>
                    <q-btn
                      :icon="volumeIcon"
                      dense
                      flat
                      rounded
                      size="sm"
                      @click="toggleMute"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="volume"
                      :min="0"
                      :step="0.01"
                      :max="1"
                    />
                  </q-item-section>
                </q-item>
              </q-menu>
            </q-btn>

            <app-update-btn
              v-if="quasar.platform.is.electron"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
            >
              <q-tooltip>
                {{ t('toolbar.updater') }}
              </q-tooltip>
            </app-update-btn>
          </div>
        </transition-group>

        <q-btn
          aria-label="Settings"
          :aria-expanded="expandSettings"
          icon="settings"
          round
          dense
          flat
          @click="expandSettings = !expandSettings"
        >
          <q-tooltip>
            {{ t('toolbar.settings') }}
          </q-tooltip>
        </q-btn>

        <template v-if="quasar.platform.is.electron">
          <q-separator
            vertical
            spaced
            inset
            dark
          />

          <q-btn
            :aria-label="t('toolbar.minimize')"
            dense
            round
            flat
            icon="minimize"
            @click="minimize"
          >
            <q-tooltip :delay="1000">
              {{ t('toolbar.minimize') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            :aria-label="t('toolbar.maximize')"
            dense
            flat
            round
            icon="crop_square"
            @click="toggleMaximize"
          >
            <q-tooltip :delay="1000">
              {{ t('toolbar.maximize') }}
            </q-tooltip>
          </q-btn>
          <q-btn
            :aria-label="t('toolbar.close')"
            dense
            flat
            round
            icon="close"
            @click="closeApp"
          >
            <q-tooltip :delay="1000">
              {{ t('toolbar.close') }}
            </q-tooltip>
          </q-btn>
        </template>
      </q-bar>

      <div
        v-if="title"
        class="row col-shrink justify-between bg-primary text-white"
      >
        <div class="col-2 row justify-start">
          <q-btn
            icon="arrow_back"
            size="md"
            rounded
            dense
            flat
            @click="navigateBack()"
          />
        </div>

        <div class="col text-h5 text-center self-center">
          {{ t(title) }}
        </div>

        <!-- Teleport target for page actions -->
        <div
          id="navbar-action"
          class="col-2 row justify-end"
        />
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { type QSelectOption, useQuasar } from 'quasar';
import {
  computed,
  onMounted,
  onUnmounted,
  provide,
  ref,
  toRaw,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';
import { useRoute, useRouter } from 'vue-router';
import LeaderboardDialog from 'components/leaderboard/LeaderboardDialog.vue';
import { useBatterySavingStore } from 'stores/battery-saving-store';
import BatterySavingDialog from 'components/layout/BatterySavingDialog.vue';
import { useGameStore } from 'stores/game-store';
import type { GameState } from 'app/common/gameState';
import { useGameSettingsStore } from 'stores/game-settings-store';
import type { GameSettings } from 'app/common/gameSettings';
import AppUpdateBtn from 'components/layout/AppUpdateBtn.vue';
import { useUpdaterStore } from 'stores/updater-store';
import BrowserPermissionRequestDialog from 'components/layout/BrowserPermissionRequestDialog.vue';

const router = useRouter();
const route = useRoute();
const quasar = useQuasar();
const { t, locale, availableLocales } = useI18n();
const { buzzer, controllers } = useBuzzer();
const gameStore = useGameStore();
const gameSettingsStore = useGameSettingsStore();

useBatterySavingStore();
useUpdaterStore();

const toggleDarkMode = quasar.dark.toggle;
const pinned = ref<boolean>(false);
const muted = ref<boolean>(false);
const volume = ref<number>(1);
const expandSettings = ref<boolean>(false);

provide('masterVolume', volume);

const devMode = process.env.DEV ?? false;

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

const title = computed<string | undefined>(() => {
  return 'title' in route.meta && typeof route.meta.title === 'string'
    ? route.meta.title
    : undefined;
});

const volumeIcon = computed<string>(() => {
  return muted.value || volume.value === 0 ? 'volume_off' : 'volume_up';
});

if (!quasar.platform.is.electron) {
  onMounted(() => {
    quasar.dialog({
      component: BrowserPermissionRequestDialog,
    });
  });
}

const supportedLanguages: QSelectOption[] = [
  {
    value: 'en-US',
    label: 'English',
  },
  {
    value: 'de-DE',
    label: 'Deutsch',
  },
  {
    value: 'es-ES',
    label: 'Español',
  },
];

const updateLocale = (l: string) => {
  if (!availableLocales.includes(l)) {
    return;
  }

  locale.value = l;
};

const toggleMute = () => {
  if (muted.value) {
    window.windowAPI.unmute();
  } else {
    window.windowAPI.mute();
  }

  muted.value = !muted.value;
};

const goToHome = async () => {
  await router.push('/');
};

const navigateBack = () => {
  router.back();
};

function minimize() {
  window.windowAPI?.minimize();
}

function toggleMaximize() {
  window.windowAPI?.toggleMaximize();
}

function togglePin() {
  if (pinned.value) {
    window.windowAPI.unpin();
  } else {
    window.windowAPI.pin();
  }

  pinned.value = !pinned.value;
}

function showLeaderboard() {
  quasar.dialog({
    component: LeaderboardDialog,
  });
}

function showBatterySavingDialog() {
  quasar.dialog({
    component: BatterySavingDialog,
  });
}

function openDevTools() {
  window.windowAPI.openDevTools();
}

onMounted(() => {
  window.addEventListener('keydown', keyDownListener);
});

onUnmounted(() => {
  window.removeEventListener('keydown', keyDownListener);
});

function keyDownListener(event: KeyboardEvent) {
  const { key, altKey } = event;
  if (altKey && key === 'F4') {
    event.preventDefault();
    closeApp();
  }
}

function closeApp() {
  quasar
    .dialog({
      title: t('exit.title'),
      message: t('exit.message'),
      ok: {
        label: t('exit.action.ok'),
        color: 'primary',
        rounded: true,
      },
      cancel: {
        label: t('exit.action.cancel'),
        color: 'primary',
        outline: true,
        rounded: true,
      },
      persistent: true,
    })
    .onOk(() => {
      buzzer
        .reset()
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          window.windowAPI.close();
        });
    });
}

function toggleCast() {
  window.castAPI.toggle();
  // Send data in case it's the initial open
  setTimeout(() => {
    sendGameState(gameStore.state);
    sendGameSettings(gameSettingsStore.gameSettings);
    sendControllerNames(controllerNames.value);
    window.castAPI.updateLocale(locale.value);
  }, 1000);
}

const controllerNames = computed<Record<string, string>>(() => {
  return controllers.value.reduce(
    (acc, curr) => {
      acc[curr.id] = curr.name;
      return acc;
    },
    {} as Record<string, string>,
  );
});

function sendControllerNames(controllers: Record<string, string>) {
  window.castAPI.updateControllers(toRaw(controllers));
}

if (quasar.platform.is.electron) {
  watch(locale, (value) => window.castAPI.updateLocale(toRaw(value)));
  watch(() => gameStore.state, sendGameState);
  watch(() => gameSettingsStore.gameSettings, sendGameSettings);
  watch(controllerNames, sendControllerNames);
}

function sendGameState(state: GameState | undefined) {
  window.castAPI.updateGameState(toValue(state));
}

function sendGameSettings(settings: GameSettings) {
  window.castAPI.updateGameSettings(toValue(settings));
}

function toValue<T>(value: T): T {
  if (value === undefined) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
}
</script>

<style lang="scss">
/* Settings menu */
.settings-container {
  padding: 2px;
  border-radius: 20px;
}

.settings-button {
  margin: 0 2px;
}

/* Animations */
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.1s ease;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

/* Remove arrows from numeric inputs */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}
</style>
