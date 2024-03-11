<template>
  <navigation-bar
    title="Questions"
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

type MenuItem = {
  routeName: string;
  label: string;
  icon?: string;
};

const items: MenuItem[] = [
  {
    routeName: 'buzzer-question',
    label: 'Buzzer',
    icon: 'radio_button_checked',
  },
  {
    routeName: 'quiz-question',
    label: 'Quiz',
    icon: 'format_list_numbered',
  },
  {
    routeName: 'stopwatch-question',
    label: 'Stopwatch',
    icon: 'timer',
  },
];
</script>
