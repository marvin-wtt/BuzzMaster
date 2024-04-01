<template>
  <q-page
    class="row"
    padding
  >
    <div class="col-12 column no-wrap">
      <!-- Content -->
      <div class="col-8 row justify-center">
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

          <div class="col-grow relative-position">
            <q-virtual-scroll
              :items="Array.from(pressedControllers)"
              class="absolute fit"
              v-slot="{ item, index }"
            >
              <q-item
                :key="item[0].id"
                dense
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
                  {{ item[0].name }}
                </q-item-section>

                <q-item-section side>
                  {{ formatTime(item[1]) }}
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
                    @click="removeController(item[0])"
                  />
                </q-item-section>
              </q-item>
            </q-virtual-scroll>
          </div>
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
      <div class="col-4 column q-gutter-y-sm justify-center content-center">
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
          <q-btn
            :label="t('question.quiz.action.settings')"
            outline
            rounded
            @click="openSettings"
          />
        </div>

        <template v-else-if="completed">
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
        </template>

        <q-btn
          v-else
          :label="t('question.stopwatch.action.cancel')"
          outline
          rounded
          @click="restart()"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import StopwatchQuestionDialog from 'components/questions/stopwatch/StopwatchQuestionDialog.vue';
import CountDown from 'components/CountDown.vue';
import { computed, onBeforeMount, onUnmounted, ref } from 'vue';
import { useBuzzer } from 'src/plugins/buzzer';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useI18n } from 'vue-i18n';
import StopwatchScoreboardButton from 'components/questions/stopwatch/StopwatchScoreboardButton.vue';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const quasar = useQuasar();
const { stopwatchSettings } = useQuestionSettingsStore();
const { controllers, buzzer } = useBuzzer();

const counter = ref<number>(0);
const started = ref<boolean>(false);
const startTime = ref<number>(0);
const pressedControllers = ref<Map<IController, number>>(
  new Map<IController, number>(),
);

const audio = new Audio('sounds/stopwatch-ping.mp3');

onBeforeMount(() => {
  buzzer.reset();
  buzzer.on('press', listener);

  audio.load();
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
  buzzer.reset();
});

const completed = computed<boolean>(() => {
  return controllers.value.length === pressedControllers.value.size;
});

const soundsEnabled = computed<boolean>(() => {
  return stopwatchSettings.playSounds;
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

  if (soundsEnabled.value) {
    const clonedAudio = audio.cloneNode() as typeof audio;
    clonedAudio.play();
  }
};

const openSettings = () => {
  quasar.dialog({
    component: StopwatchQuestionDialog,
  });
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
