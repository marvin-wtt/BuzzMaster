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
            <div class="text-body2">
              {{ t('app_name') }}
            </div>
          </div>
        </q-btn>

        <q-space />

        <q-btn
          dense
          flat
          icon="leaderboard"
          @click="showScoreboard"
        />

        <transition name="slide-fade">
          <!-- TODO Add bg color -->
          <div v-if="expandSettings">
            <q-btn
              dense
              flat
              :icon="pinned ? 'lock_open' : 'push_pin'"
              @click="togglePin"
            />

            <q-btn
              dense
              flat
              :icon="muted ? 'volume_off' : 'volume_up'"
              @click="toggleMute"
            />

            <q-btn
              dense
              flat
              :icon="darkMode ? 'light_mode' : 'dark_mode'"
              @click="toggleDarkMode"
            />
          </div>
        </transition>

        <q-btn
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
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';
import { useRouter } from 'vue-router';
import { useAppSettingsStore } from 'stores/application-settings-store';
import { storeToRefs } from 'pinia';
import ScoreboardDialog from 'components/scoreboard/ScoreboardDialog.vue';

const router = useRouter();
const quasar = useQuasar();
const { t } = useI18n();
const { buzzer } = useBuzzer();
const applicationStore = useAppSettingsStore();

const { muted } = storeToRefs(applicationStore);
const toggleDarkMode = quasar.dark.toggle;
const pinned = ref<boolean>(false);
const expandSettings = ref<boolean>(false);

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
