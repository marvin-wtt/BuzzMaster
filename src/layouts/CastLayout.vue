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
          @click.stop="transparent"
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

const layoutClass = computed<string | undefined>(() => {
  return showAppBar.value ? 'layout' : undefined;
});

const darkMode = computed<boolean>(() => {
  return quasar.dark.isActive;
});

function onFocus() {
  showAppBar.value = true;
}

function onBlur() {
  // TODO
  //showAppBar.value = false;
}

function closeWindow() {
  window.windowAPI.close();
}

function transparent() {
  showAppBar.value = false;
}
</script>

<style>
body.body--dark {
  background: transparent !important;
}

body.body--light .layout {
  background: #000;
}

body.body--light .layout {
  background: #fff;
}

.layout:focus {
  box-shadow: inset 0 0 0 1px gray;
}
</style>
