<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-bar class="q-electron-drag bg-primary">
        <q-icon name="cast" />
        <div>
          {{ t('app_name') }}
        </div>

        <q-space />

        <q-btn
          dense
          flat
          :icon="darkMode ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';

const quasar = useQuasar();
const { t } = useI18n();
const { reset } = useBuzzer();

const toggleDarkMode = quasar.dark.toggle;

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

// TODO Add typescript support
function minimize() {
  window.windowAPI?.minimize();
}

function toggleMaximize() {
  window.windowAPI?.toggleMaximize();
}

function closeApp() {
  reset();
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
</style>
