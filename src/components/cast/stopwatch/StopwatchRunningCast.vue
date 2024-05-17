<template>
  <div class="column col-11">
    <beep-timer
      :time="props.state.time"
      :precision="2"
      class="text-center text-h2"
    />

    <q-separator />

    <div class="col-grow relative-position">
      <q-virtual-scroll
        :items="result"
        class="absolute fit"
        type="table"
        separator="none"
        dense
        flat
        style="background-color: transparent"
        v-slot="{ item, index }: { item: ResultItem; index: number }"
      >
        <tr
          :key="item.id"
          class="entry"
        >
          <td>
            <q-avatar
              v-if="item.time !== undefined"
              :color="avatarColor(index)"
              text-color="white"
              size="md"
            >
              {{ index + 1 }}
            </q-avatar>
            <q-avatar
              v-else
              :color="avatarColor(-1)"
              text-color="white"
              size="md"
            >
              -
            </q-avatar>
          </td>

          <td class="full-width">
            {{ item.name }}
          </td>

          <td>
            <stopwatch-time :time="item.time" />
          </td>

          <td
            v-if="item.points !== undefined"
            :class="pointsClass(item.points)"
            class="text-right"
          >
            {{ n(item.points, { signDisplay: 'exceptZero' }) }}
          </td>
        </tr>
      </q-virtual-scroll>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BeepTimer from 'components/TimerAnimated.vue';
import {
  StopwatchCompletedState,
  StopwatchPausedState,
  StopwatchRunningState,
} from 'app/common/gameState/StopwatchState';
import StopwatchTime from 'components/gameModes/stopwatch/StopwatchTime.vue';
import { useCastStore } from 'stores/cast-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { n } = useI18n();
const castStore = useCastStore();
const { controllers } = storeToRefs(castStore);

const props = defineProps<{
  state: StopwatchRunningState | StopwatchPausedState | StopwatchCompletedState;
}>();

interface ResultItem {
  id: string;
  name: string;
  time?: number;
  points?: number;
}

const result = computed<ResultItem[]>(() => {
  return Object.keys(props.state.result)
    .map((controllerId) => {
      const points =
        props.state.name === 'completed' && props.state.points
          ? props.state.points[controllerId]
          : undefined;

      return {
        id: controllerId,
        name: controllers.value[controllerId],
        time: props.state.result[controllerId] ?? undefined,
        points,
      };
    })
    .sort((a, b) => {
      if (a.time === undefined && b.time === undefined) {
        return 0;
      }

      if (a.time === undefined) {
        return 1;
      }

      if (b.time === undefined) {
        return -1;
      }

      return a.time - b.time;
    });
});

const pointsClass = (points: number | undefined): string => {
  if (points === undefined || points === 0) {
    return 'text-blue';
  }

  if (points > 0) {
    return 'text-green';
  }

  return 'text-red';
};

const avatarColor = (index: number) => {
  switch (index) {
    case 0:
      return 'primary';
    case 1:
      return 'secondary';
    case 2:
      return 'info';
  }

  return 'grey';
};
</script>

<style scoped>
.entry td {
  font-size: 18pt;
}
</style>
