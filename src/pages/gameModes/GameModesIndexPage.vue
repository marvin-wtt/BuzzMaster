<template>
  <q-page
    class="row justify-center content-center"
    padding
  >
    <div
      class="col-xs-10 col-sm-8 col-md-6 col-lg-4 col-xl-3 column q-gutter-y-md"
    >
      <div
        v-for="section in sections"
        :key="section.key"
      >
        <div class="section-header full-width text-h5">
          {{ section.label }}
        </div>
        <div class="row q-gutter-sm">
          <div
            v-for="item in section.items"
            :key="item.routeName"
            class="col-xs-12 col-sm-5 col-md-4 column q-gutter-col-md"
          >
            <q-btn
              :to="{ name: item.routeName }"
              :label="item.label"
              :icon="item.icon"
              color="primary"
              rounded
              stack
            />
          </div>
          <div
            v-if="section.items.length === 0"
            class="text-subtitle2 text-italic"
          >
            {{ t('gameMode.noEntries') }}
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

interface MenuSection {
  label: string;
  key: string;
  icon?: string;
  items: MenuItem[];
}

interface MenuItem {
  routeName: string;
  label: string;
  icon?: string;
}

const sections = computed<MenuSection[]>(() => [
  {
    label: t('gameMode.section.show'),
    key: 'show',
    items: [
      {
        routeName: 'buzzer-game',
        label: t('gameMode.action.buzzer'),
        icon: 'sym_o_radio_button_checked',
      },
      {
        routeName: 'quiz-game',
        label: t('gameMode.action.quiz'),
        icon: 'sym_o_format_list_numbered',
      },
    ],
  },
  {
    label: t('gameMode.section.games'),
    key: 'games',
    items: [
      {
        routeName: 'pong-game',
        label: t('gameMode.action.pong'),
        icon: 'sym_o_sports_tennis',
      },
    ],
  },
  {
    label: t('gameMode.section.utilities'),
    key: 'utility',
    items: [
      {
        routeName: 'stopwatch-game',
        label: t('gameMode.action.stopwatch'),
        icon: 'sym_o_timer',
      },
      {
        routeName: 'viewing-rate-game',
        label: t('gameMode.action.viewingRate'),
        icon: 'sym_o_trending_up',
      },
    ],
  },
]);
</script>

<style scoped>
.section-header {
  border-bottom: 1px solid;
  margin-bottom: 1em;
}
</style>
