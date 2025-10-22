<template>
  <q-page
    class="row justify-center content-center"
    padding
  >
    <div
      class="col-xs-10 col-sm-8 col-md-4 col-lg-3 col-xl-2 column q-gutter-y-md"
    >
      <q-btn
        v-for="item in items"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        :label="item.label"
        :icon="item.icon"
        color="primary"
        rounded
        stack
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

type MenuItem = {
  routeName: string;
  label: string;
  icon?: string;
};

const items = computed<MenuItem[]>(() => [
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
  {
    routeName: 'pong-game',
    label: t('gameMode.action.pong'),
    icon: 'sym_o_sports_tennis',
  },
]);
</script>
