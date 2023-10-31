<template>
  <navigation-bar
    title="Questions"
    padding
  >
    <div class="col-10 column justify-center">
      <q-btn
        :to="{ name: 'buzzer-question' }"
        label="Buzzer Question"
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
