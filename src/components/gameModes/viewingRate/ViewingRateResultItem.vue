<template>
  <q-item class="column q-my-xs">
    <div class="text-subtitle1">{{ props.name }}</div>

    <div class="relative-position full-width row bg-grey rounded-borders">
      <div
        v-for="(slot, index) of timeSlots"
        :key="index"
        :style="{ width: `${slot.length * 100}%` }"
        :class="slot.viewing ? 'bg-primary' : ''"
        class="rounded-borders"
        style="height: 15px"
      />
    </div>
  </q-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  name: string;
  times: number[];
  totalTime: number;
  default: boolean;
}>();

interface TimeSlot {
  length: number;
  viewing: boolean;
}

const timeSlots = computed<TimeSlot[]>(() => {
  const times = [...props.times, props.totalTime];
  const slots: TimeSlot[] = [];

  let viewing: boolean = props.default;
  let previousTime = 0;
  for (const time of times) {
    const diff = time - previousTime;
    const length = diff / props.totalTime;

    slots.push({
      length,
      viewing,
    });

    previousTime = time;
    viewing = !viewing;
  }

  return slots;
});
</script>

<style scoped></style>
