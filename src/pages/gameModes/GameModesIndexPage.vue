<template>
  <q-page class="row justify-center q-pa-md">
    <div class="bm-modes column q-gutter-y-md">
      <section
        v-for="section in sections"
        :key="section.key"
        class="column q-gutter-y-xs"
      >
        <div class="bm-section">
          {{ t(section.labelKey) }}
        </div>

        <menu-row
          v-for="item in section.items"
          :key="item.routeName"
          :label="t(item.labelKey)"
          :icon="item.icon"
          :shortcut="item.shortcut"
          :primary="item.routeName === PRIMARY_MODE"
          :to="{ name: item.routeName }"
        />

        <div
          v-if="section.items.length === 0"
          class="text-caption text-italic bm-dim"
        >
          {{ t('gameMode.noEntries') }}
        </div>
      </section>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import MenuRow from 'components/MenuRow.vue';
import { useShortcuts } from 'src/composables/shortcuts';

const { t } = useI18n();
const router = useRouter();

interface ModeEntry {
  routeName: string;
  labelKey: string;
  icon: string;
}

interface MenuSection {
  key: string;
  labelKey: string;
  items: (ModeEntry & { shortcut: string })[];
}

/** The mode a quiz show starts with — highlighted and reachable with "1". */
const PRIMARY_MODE = 'buzzer-game';

const layout: { key: string; labelKey: string; items: ModeEntry[] }[] = [
  {
    key: 'show',
    labelKey: 'gameMode.section.show',
    items: [
      {
        routeName: 'buzzer-game',
        labelKey: 'gameMode.action.buzzer',
        icon: 'sym_o_radio_button_checked',
      },
      {
        routeName: 'quiz-game',
        labelKey: 'gameMode.action.quiz',
        icon: 'sym_o_format_list_numbered',
      },
    ],
  },
  {
    key: 'games',
    labelKey: 'gameMode.section.games',
    items: [
      {
        routeName: 'simon-game',
        labelKey: 'gameMode.action.simon',
        icon: 'grid_view',
      },
      {
        routeName: 'pong-game',
        labelKey: 'gameMode.action.pong',
        icon: 'sym_o_sports_tennis',
      },
    ],
  },
  {
    key: 'utility',
    labelKey: 'gameMode.section.utilities',
    items: [
      {
        routeName: 'stopwatch-game',
        labelKey: 'gameMode.action.stopwatch',
        icon: 'sym_o_timer',
      },
      {
        routeName: 'viewing-rate-game',
        labelKey: 'gameMode.action.viewingRate',
        icon: 'sym_o_trending_up',
      },
    ],
  },
];

// Number keys run straight down the page, across section boundaries.
let key = 0;
const sections: MenuSection[] = layout.map((section) => ({
  ...section,
  items: section.items.map((item) => ({ ...item, shortcut: String(++key) })),
}));

useShortcuts(
  Object.fromEntries(
    sections
      .flatMap((section) => section.items)
      .map((item) => [
        item.shortcut,
        () => void router.push({ name: item.routeName }),
      ]),
  ),
);
</script>

<style lang="scss" scoped>
.bm-modes {
  width: 100%;
  max-width: 420px;
}
</style>
