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
            icon="emoji_events"
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

            <!-- Battery Saving -->
            <q-btn
              aria-label="Battery saving"
              dense
              flat
              rounded
              size="sm"
              key="battery-saving"
              icon="battery_saver"
              class="settings-button bg-primary"
              :color="showBatterySavingButton ? 'warning' : undefined"
              @click="showBatterySavingDialog"
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
import { QSelectOption, useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';
import { useRoute, useRouter } from 'vue-router';
import ScoreboardDialog from 'components/scoreboard/ScoreboardDialog.vue';
import { useBatterySavingStore } from 'stores/battery-saving-store';
import BatterySavingDialog from 'components/layout/BatterySavingDialog.vue';

const router = useRouter();
const route = useRoute();
const quasar = useQuasar();
const { t, locale, availableLocales } = useI18n();
const { buzzer } = useBuzzer();
const batterySavingStore = useBatterySavingStore();

const toggleDarkMode = quasar.dark.toggle;
const pinned = ref<boolean>(false);
const muted = ref<boolean>(false);
const expandSettings = ref<boolean>(false);

const devMode = process.env.DEV ?? false;

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

const title = computed<string | undefined>(() => {
  return 'title' in route.meta && typeof route.meta.title === 'string'
    ? route.meta.title
    : undefined;
});

const supportedLanguages: QSelectOption[] = [
  {
    value: 'en-US',
    label: 'English',
  },
  {
    value: 'de-DE',
    label: 'Deutsch',
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

const goToHome = () => {
  router.push('/');
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

function showScoreboard() {
  quasar.dialog({
    component: ScoreboardDialog,
  });
}

const showBatterySavingButton = computed<boolean>(() => {
  return batterySavingStore.criticalBatterySavingTimes.length > 0;
});

function showBatterySavingDialog() {
  quasar.dialog({
    component: BatterySavingDialog,
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

/* Remove arrows from numeric inputs */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}
</style>
