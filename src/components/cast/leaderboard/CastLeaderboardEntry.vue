<template>
  <q-item>
    <q-item-section avatar>
      <q-avatar
        :color="avatarColor(props.entry.position)"
        text-color="white"
      >
        {{ props.entry.position }}
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ props.entry.name }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      {{ props.entry.value }}
    </q-item-section>
  </q-item>
</template>

<script lang="ts" setup>
import { LeaderboardEntry } from 'app/common/gameState/LeaderboardState';

const props = defineProps<{
  entry: LeaderboardEntry;
}>();

const avatarColor = (index: number) => {
  switch (index) {
    case 1:
      return 'primary';
    case 2:
      return 'secondary';
    case 3:
      return 'info';
  }

  return 'grey';
};
</script>

<style scoped></style>
