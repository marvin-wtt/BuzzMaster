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

        <transition-group
          name="list"
          type="animation"
        >
          <q-btn
            key="leaderboard"
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
            class="settings-container bg-white"
          >
            <!-- Pin -->
            <q-btn
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="pinned ? 'lock_open' : 'push_pin'"
              @click="togglePin"
            />

            <!-- Mute -->
            <q-btn
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="muted ? 'volume_off' : 'volume_up'"
              @click="toggleMute"
            />

            <!-- Dark mode -->
            <q-btn
              dense
              flat
              rounded
              size="sm"
              class="settings-button bg-primary"
              :icon="darkMode ? 'light_mode' : 'dark_mode'"
              @click="toggleDarkMode"
            />
          </div>
        </transition-group>

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
