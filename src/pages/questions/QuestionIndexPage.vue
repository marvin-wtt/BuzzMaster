<template>
  <navigation-bar
    title="Questions"
    padding
  >
    <div class="col-10 column justify-center q-gutter-md">
      <q-btn
        :to="{ name: 'buzzer-question' }"
        label="Buzzer"
        color="primary"
        rounded
      />

      <q-btn
        :to="{ name: 'quiz-question' }"
        label="Quiz"
        color="primary"
        rounded
      />
    </div>

    <!-- content -->
  </navigation-bar>
</template>

<script lang="ts" setup>
import NavigationBar from 'components/PageNavigation.vue';
</script>
