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
import { reactive } from 'vue';

const { t } = useI18n();

type MenuItem = {
  routeName: string;
  label: string;
  icon?: string;
};

const items: MenuItem[] = reactive([
  {
    routeName: 'buzzer-game',
    label: t('gameMode.action.buzzer'),
    icon: 'radio_button_checked',
  },
  {
    routeName: 'quiz-game',
    label: t('gameMode.action.quiz'),
    icon: 'format_list_numbered',
  },
  {
    routeName: 'stopwatch-game',
    label: t('gameMode.action.stopwatch'),
    icon: 'timer',
  },
]);
</script>
