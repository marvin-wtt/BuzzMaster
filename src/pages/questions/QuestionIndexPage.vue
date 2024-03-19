<template>
  <navigation-bar
    :title="t('question.title')"
    padding
  >
    <div class="col-10 column justify-center q-gutter-md">
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

    <!-- content -->
  </navigation-bar>
</template>

<script lang="ts" setup>
import NavigationBar from 'components/PageNavigation.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

type MenuItem = {
  routeName: string;
  label: string;
  icon?: string;
};

const items: MenuItem[] = [
  {
    routeName: 'buzzer-question',
    label: t('question.action.buzzer'),
    icon: 'radio_button_checked',
  },
  {
    routeName: 'quiz-question',
    label: t('question.action.quiz'),
    icon: 'format_list_numbered',
  },
  {
    routeName: 'stopwatch-question',
    label: t('question.action.stopwatch'),
    icon: 'timer',
  },
];
</script>
