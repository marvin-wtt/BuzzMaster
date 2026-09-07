<template>
  <q-page class="column no-wrap q-pa-md">
    <!-- Brand -->
    <div class="col-grow column items-center justify-center">
      <div class="bm-brand">
        <q-img
          src="logo.png"
          alt=""
          class="bm-brand__logo"
          no-spinner
        />
      </div>

      <h1 class="bm-brand__name">
        {{ t('app_name') }}
      </h1>

      <div
        v-if="quasar.platform.is.electron"
        class="bm-brand__version bm-num"
      >
        v{{ version }}
      </div>
    </div>

    <!-- Menu -->
    <nav class="bm-home__menu column q-gutter-y-sm">
      <menu-row
        primary
        icon="play_arrow"
        :label="t('action.start')"
        shortcut="↵"
        to="/gameModes"
      />
      <menu-row
        icon="emoji_events"
        :label="t('action.leaderboard')"
        shortcut="L"
        :to="{ name: 'leaderboard' }"
      />
      <menu-row
        icon="sports_esports"
        :label="t('action.devices')"
        shortcut="G"
        :to="{ name: 'devices' }"
      />
    </nav>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useUpdaterStore } from 'stores/updater-store';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import MenuRow from 'components/MenuRow.vue';
import { useShortcuts } from 'src/composables/shortcuts';

const quasar = useQuasar();
const router = useRouter();
const { t } = useI18n();
const updaterStore = useUpdaterStore();
const { version } = storeToRefs(updaterStore);

useShortcuts({
  Enter: () => void router.push('/gameModes'),
  l: () => void router.push({ name: 'leaderboard' }),
  g: () => void router.push({ name: 'devices' }),
});
</script>

<style lang="scss" scoped>
.bm-brand {
  width: 168px;
  height: 168px;
  display: grid;
  place-items: center;
  border-radius: 28px;
  border: 1px solid var(--bm-line);
  background:
    radial-gradient(circle at 32% 26%, var(--bm-accent-soft), transparent 62%),
    var(--bm-surface);
}

.bm-brand__logo {
  width: 108px;
}

.bm-brand__name {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin: 20px 0 0;
}

.bm-brand__version {
  font-size: 0.688rem;
  letter-spacing: 0.08em;
  color: var(--bm-faint);
  margin-top: 4px;
}

.bm-home__menu {
  width: 100%;
  max-width: 380px;
  align-self: center;
}
</style>
