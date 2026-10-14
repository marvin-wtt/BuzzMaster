<template>
  <q-layout
    @focus="onFocus"
    @blur="onBlur"
    view="hHh Lpr fFf"
    :class="layoutClass"
  >
    <q-header
      v-if="showAppBar"
      :class="darkMode ? 'bg-grey-10' : 'bg-grey-2'"
      elevated
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <q-bar class="q-electron-drag">
        {{ t('cast.title') }}

        <q-space />

        <!-- Dark mode -->
        <q-btn
          :aria-label="t('cast.toolbar.darkMode')"
          dense
          flat
          round
          :icon="darkMode ? 'light_mode' : 'dark_mode'"
          @click="toggleDarkMode"
        >
          <q-tooltip :delay="1000">
            {{ t('cast.toolbar.darkMode') }}
          </q-tooltip>
        </q-btn>

        <q-btn
          :aria-label="t('cast.toolbar.transparent')"
          dense
          flat
          round
          icon="visibility_off"
          @click.stop="setTransparent"
        >
          <q-tooltip :delay="1000">
            {{ t('cast.toolbar.transparent') }}
          </q-tooltip>
        </q-btn>

        <q-btn
          :aria-label="t('cast.toolbar.close')"
          dense
          flat
          round
          icon="close"
          @click="closeWindow"
        >
          <q-tooltip :delay="1000">
            {{ t('cast.toolbar.close') }}
          </q-tooltip>
        </q-btn>
      </q-bar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { useCastStore } from '@/stores/cast-store';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const castStore = useCastStore();
const quasar = useQuasar();
const { t } = useI18n();

quasar.dark.set(true);
const toggleDarkMode = quasar.dark.toggle;

const router = useRouter();

/**
 * Route to the page for the current game.
 *
 * This used to live in `cast-store`, which made the store unusable by any
 * surface without these routes — notably the PowerPoint add-in. Behaviour is
 * unchanged: go via the index page first, so a page never sees state belonging
 * to a different game.
 */
watch(
  () => castStore.gameState,
  (state, previous) => {
    if (previous?.game === state?.game) {
      return;
    }

    void router.push({ name: 'cast' });

    if (state === undefined) {
      return;
    }

    const routeName = `cast-${state.game}`;
    if (router.hasRoute(routeName)) {
      void router.push({ name: routeName });
    }
  },
);

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
@import '@fontsource-variable/inter';

* {
  font-family: 'Inter Variable', sans-serif;
}

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
