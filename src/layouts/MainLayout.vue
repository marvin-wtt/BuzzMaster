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
            aria-label="Show scoreboard"
            key="scoreboard"
            dense
            flat
            rounded
            icon="leaderboard"
            @click="showScoreboard"
          />

          <!-- Settings -->
          <div
            v-if="expandSettings"
            key="settings"
            class="settings-container bg-white row no-wrap"
          >
            <!-- Pin -->
            <q-btn
              aria-label="Pin window"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="pinned ? 'lock_open' : 'push_pin'"
              @click="togglePin"
            />

            <!-- Dev tools -->
            <q-btn
              v-if="devMode"
              aria-label="DevTools"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              icon="developer_mode"
              @click="openDevTools"
            />

            <!-- Dark mode -->
            <q-btn
              aria-label="Toggle dark mode"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="darkMode ? 'light_mode' : 'dark_mode'"
              @click="toggleDarkMode"
            />

            <!-- Change locale -->
            <q-btn
              v-if="supportedLanguages.length > 1"
              aria-label="Language"
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
              aria-label="Mute audio"
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="muted ? 'volume_off' : 'volume_up'"
              @click="toggleMute"
            />
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
        />

        <q-separator
          vertical
          spaced
          inset
          dark
        />

        <q-btn
          dense
          flat
          icon="minimize"
          @click="minimize"
        />
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="toggleMaximize"
        />
        <q-btn
          dense
          flat
          icon="close"
          @click="closeApp"
        />
      </q-bar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { QSelectOption, useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';
import { useRouter } from 'vue-router';
import { useAppSettingsStore } from 'stores/application-settings-store';
import { storeToRefs } from 'pinia';
import ScoreboardDialog from 'components/scoreboard/ScoreboardDialog.vue';

const router = useRouter();
const quasar = useQuasar();
const { t, locale, availableLocales } = useI18n();
const { buzzer } = useBuzzer();
const applicationStore = useAppSettingsStore();

const { muted } = storeToRefs(applicationStore);
const toggleDarkMode = quasar.dark.toggle;
const pinned = ref<boolean>(false);
const expandSettings = ref<boolean>(false);

const devMode = process?.env?.DEV ?? false;

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

const supportedLanguages = ref<QSelectOption[]>([
  {
    value: 'en-US',
    label: 'English',
  },
  {
    value: 'de-DE',
    label: 'Deutsch',
  },
]);

const updateLocale = (l: string) => {
  if (!availableLocales.includes(l)) {
    return;
  }

  locale.value = l;
};

const toggleMute = () => {
  muted.value = !muted.value;
};

const goToHome = () => {
  router.push('/');
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

function showScoreboard() {
  quasar.dialog({
    component: ScoreboardDialog,
  });
}

function openDevTools() {
  window.windowAPI.openDevTools();
}

function closeApp() {
  buzzer.reset();
  window.windowAPI?.close();
}
</script>

<style lang="scss">
/* width */
::-webkit-scrollbar {
  width: 0.6rem;
  height: 0.5rem;
}

/* Scrollbar */
/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 0.125rem grey;
  border-radius: 0.25rem;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #656565;
  border-radius: 0.25rem;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: $primary;
}

::-webkit-scrollbar-corner {
}

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
</style>
