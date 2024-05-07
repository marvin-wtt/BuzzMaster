<template>
  <q-layout
    @focus="onFocus"
    @blur="onBlur"
    view="hHh Lpr fFf"
    :class="layoutClass"
  >
    <q-header
      v-if="showAppBar"
      class="bg-grey"
      elevated
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <q-bar class="q-electron-drag">
        Cast

        <q-space />

        <!-- Dark mode -->
        <q-btn
          dense
          flat
          rounded
          :icon="darkMode ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
        />

        <q-btn
          dense
          flat
          rounded
          icon="visibility_off"
          @click.stop="setTransparent"
        />

        <q-btn
          dense
          flat
          rounded
          icon="close"
          @click.stop="closeWindow"
        />
      </q-bar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useCastStore } from 'stores/cast-store';
import { useQuasar } from 'quasar';
import { computed, ref } from 'vue';

const castStore = useCastStore();
const quasar = useQuasar();

quasar.dark.set(true);
const toggleDarkMode = quasar.dark.toggle;

window.castAPI.onGameStateUpdate(castStore.updateGameState);
window.castAPI.onGameSettingsUpdate(castStore.updateGameSettings);
window.castAPI.onLocaleUpdate(castStore.updateLocale);
window.castAPI.onControllerUpdate(castStore.updateControllers);

const showAppBar = ref<boolean>(true);
const transparent = ref<boolean>(false);
const mouseOverMenu = ref<boolean>(false);

const layoutClass = computed<string | undefined>(() => {
  return transparent.value ? undefined : 'layout';
});

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

function onFocus() {
  showAppBar.value = true;
  transparent.value = false;
}

function onBlur() {
  if (mouseOverMenu.value) {
    return;
  }
  showAppBar.value = false;
}

function onMouseEnter() {
  mouseOverMenu.value = true;
}

function onMouseLeave() {
  mouseOverMenu.value = false;
}

function closeWindow() {
  window.windowAPI.close();
}

function setTransparent() {
  transparent.value = true;
  showAppBar.value = false;
}
</script>

<style>
body.body--dark {
  background: transparent !important;
}

body.body--light .layout {
  background: #fff;
}

body.body--dark .layout {
  background: var(--q-dark-page) !important;
}

.layout:focus {
  box-shadow: inset 0 0 0 1px gray;
}
</style>
