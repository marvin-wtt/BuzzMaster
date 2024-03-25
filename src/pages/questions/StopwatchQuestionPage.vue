<template>
  <navigation-bar
    :title="t('question.stopwatch.title')"
    padding
  >
    <div class="col-12 column justify-around no-wrap">
      <!-- Content -->
      <div class="col-grow row justify-center">
        <div
          v-if="started"
          class="column col-xs-11 col-sm-7 col-md-5 col-lg-3 col-xl-2 q-mb-sm"
        >
          <!-- Result -->
          <count-down
            v-model="counter"
            :paused="completed"
            :precision="2"
            :update-rate="100"
            reverse
            class="text-center text-h6"
          />

          <q-separator />

          <q-list dense>
            <q-item
              v-for="(entry, index) in Array.from(pressedControllers)"
              :key="entry[0].id"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="avatarColor(index)"
                  text-color="white"
                  size="sm"
                >
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                {{ entry[0].name }}
              </q-item-section>

              <q-item-section side>
                {{ formatTime(entry[1]) }}
              </q-item-section>

              <q-item-section
                side
                v-if="!completed"
              >
                <q-btn
                  icon="close"
                  size="sm"
                  rounded
                  dense
                  @click="removeController(entry[0])"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div
          v-else
          class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center text-h5"
        >
          {{
            t('question.stopwatch.controllersReady', {
              count: controllers.length,
            })
          }}
        </div>
      </div>
      <!-- Actions -->
      <div class="col-2 column content-center">
        <div
          v-if="!started"
          class="column q-gutter-sm"
        >
          <q-btn
            :label="t('question.stopwatch.action.start')"
            color="primary"
            rounded
            @click="start()"
          />
        </div>

        <div
          class="col-12 column q-gutter-y-sm no-wrap content-center justify-around"
          v-else-if="completed"
        >
          <stopwatch-scoreboard-button
            :label="t('question.stopwatch.action.scores')"
            :controllers="Array.from(pressedControllers.keys())"
          />

          <q-separator />
          <!-- First row -->
          <q-btn
            :label="t('question.stopwatch.action.quickPlay')"
            icon="fast_forward"
            color="primary"
            class="self-center"
            rounded
            @click="quickPlay()"
          />
          <!-- Second row -->
          <q-btn
            :label="t('question.stopwatch.action.reset')"
            icon="replay"
            class="self-center"
            outline
            rounded
            @click="restart()"
          />
        </div>

        <div v-else>
          <q-btn
            :label="t('question.stopwatch.action.cancel')"
            outline
            rounded
            @click="restart()"
          />
        </div>
      </div>
    </div>
  </navigation-bar>
</template>

<script lang="ts" setup>
import CountDown from 'components/CountDown.vue';
import NavigationBar from 'components/PageNavigation.vue';
import { computed, onBeforeMount, onUnmounted, ref } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';
import StopwatchScoreboardButton from 'components/questions/stopwatch/StopwatchScoreboardButton.vue';

const { t } = useI18n();
const { controllers, buzzer } = useBuzzer();

const counter = ref<number>(0);
const started = ref<boolean>(false);
const startTime = ref<number>(0);
const pressedControllers = ref<Map<IController, number>>(
  new Map<IController, number>(),
);

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});

const completed = computed<boolean>(() => {
  return controllers.value.length === pressedControllers.value.size;
});

const listener = (event: ButtonEvent) => {
  if (!started.value) {
    return;
  }

  if (event.button !== BuzzerButton.RED) {
    return;
  }

  if (pressedControllers.value.has(event.controller)) {
    return;
  }

  const time = new Date().getTime() - startTime.value;

  pressedControllers.value.set(event.controller, time);
  event.controller.setLight(true);
};

const restart = () => {
  buzzer.reset();

  pressedControllers.value = new Map<IController, number>();
  started.value = false;
  counter.value = 0;
};

const quickPlay = () => {
  restart();
  start();
};

const start = () => {
  started.value = true;
  startTime.value = new Date().getTime();
};

const formatTime = (time: number) => {
  const date = new Date(time);

  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds())
    .padStart(3, '0')
    .slice(0, 2);

  return `${minutes}:${seconds}.${milliseconds}`;
};

const removeController = (controller: IController) => {
  pressedControllers.value.delete(controller);
  controller.setLight(false);
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
