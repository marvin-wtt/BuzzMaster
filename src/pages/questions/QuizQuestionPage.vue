<template>
  <navigation-bar
    title="Quiz Question"
    padding
  >
    <div class="col-12 column justify-around">
      <!-- Content -->
      <div class="col-grow row justify-center">
        <div
          class="col-xs-7 col-sm-6 col-md-5 col-lg-4 col-xl-3 self-center text-center justify-center"
        >
          <transition-fade>
            <!-- Start -->
            <pulse-circle
              v-if="!started"
              :pulse="false"
              class="column justify-center q-col-gutter-sm text-h5"
            >
              <div>
                {{ controllers.length + ' controllers ready!' }}
              </div>
              <div>
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.BLUE)
                      ? 'blue'
                      : 'grey'
                  "
                />
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.ORANGE)
                      ? 'orange'
                      : 'grey'
                  "
                />
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.GREEN)
                      ? 'green'
                      : 'grey'
                  "
                />
                <q-icon
                  name="circle"
                  :color="
                    quizSettings.activeButtons.includes(BuzzerButton.YELLOW)
                      ? 'yellow'
                      : 'grey'
                  "
                />
              </div>
            </pulse-circle>

            <!-- Waiting for answers -->
            <circle-timer
              v-else-if="!showResults"
              v-model="countDownTime"
              :max="quizSettings.answerTime"
            >
              <count-down
                v-if="quizSettings.answerTime > 0"
                v-model="countDownTime"
                :beep="soundsEnabled"
                :beep-start-time="quizSettings.countDownBeepStartAt"
              />
            </circle-timer>

            <div v-else-if="showResults">
              <!-- TODO Show results -->
            </div>
          </transition-fade>
        </div>
      </div>
      <!-- Actions -->
      <div class="col-2 column content-center">
        <transition-fade>
          <div
            v-if="!started"
            class="column q-gutter-sm"
          >
            <q-btn
              label="Start"
              color="primary"
              rounded
              @click="start()"
            />
            <q-btn
              label="Settings"
              outline
              rounded
              @click="openSettings"
            />
          </div>

          <div
            class="col-12"
            v-if="done && showResults"
          >
            <!-- First row -->
            <div class="row q-gutter-sm">
              <!-- TODO Add buttons -->
              <!--            <q-btn-->
              <!--              label="Re-open"-->
              <!--              icon="loop"-->
              <!--              color="primary"-->
              <!--              rounded-->
              <!--              :outline="allControllersPressed"-->
              <!--              :disable="allControllersPressed"-->
              <!--              @click="continueQuestion()"-->
              <!--            />-->
              <!--            <q-btn-->
              <!--              label="Quick Play"-->
              <!--              icon="fast_forward"-->
              <!--              color="primary"-->
              <!--              rounded-->
              <!--              @click="quickPlay()"-->
              <!--            />-->
            </div>
            <!-- Second row -->
            <div class="row justify-center q-mt-md">
              <q-btn
                label="Reset"
                icon="replay"
                outline
                rounded
                @click="restart()"
              />
            </div>
          </div>

          <div v-if="started && !done">
            <q-btn
              label="Cancel"
              outline
              rounded
              @click="restart()"
            />
          </div>
        </transition-fade>
      </div>
    </div>
  </navigation-bar>
</template>

<script lang="ts" setup>
import CountDown from 'components/CountDown.vue';
import CircleTimer from 'components/CircleTimer.vue';
import PulseCircle from 'components/PulseCircle.vue';
import NavigationBar from 'components/PageNavigation.vue';
import QuizQuestionDialog from 'components/questions/QuizQuestionDialog.vue';
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useBuzzer } from 'src/plugins/buzzer';
import { useQuestionSettingsStore } from 'stores/question-settings-store';
import {
  ButtonPressEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useAppSettingsStore } from 'stores/application-settings-store';
import { storeToRefs } from 'pinia';
import TransitionFade from 'components/TransitionFade.vue';

const quasar = useQuasar();
const { quizSettings } = useQuestionSettingsStore();
const appSettingsStore = useAppSettingsStore();
const { controllers, reset, onButtonPressed, removeListener } = useBuzzer();

const { muted: globalMuted } = storeToRefs(appSettingsStore);
const started = ref<boolean>(false);
const countDownTime = ref<number>(0);
const showResults = ref<boolean>(false);

onBeforeMount(() => {
  reset();

  onButtonPressed(listener);
});

onUnmounted(() => {
  removeListener('press', listener);
  reset();
});

const pressedButtons = ref<Map<string, BuzzerButton>>(
  new Map<string, BuzzerButton>()
);
const confirmedControllers = ref<string[]>([]);

const listener = (event: ButtonPressEvent) => {
  if (!started.value) {
    return;
  }

  if (confirmedControllers.value.includes(event.controller.id)) {
    return;
  }

  if (event.button === BuzzerButton.RED) {
    if (quizSettings.changeMode !== 'confirm') {
      return;
    }

    if (!pressedButtons.value.has(event.controller.id)) {
      return;
    }

    confirmButton(event.controller);
    return;
  }

  if (!quizSettings.activeButtons.includes(event.button)) {
    return;
  }

  pressedButtons.value.set(event.controller.id, event.button);

  if (quizSettings.changeMode === 'never') {
    confirmButton(event.controller);
  }
};

const confirmButton = (controller: IController) => {
  confirmedControllers.value.push(controller.id);
  controller.setLight(true);
};

const done = computed<boolean>(() => {
  if (!started.value) {
    return false;
  }

  if (countDownTime.value <= 0) {
    return true;
  }

  if (
    (quizSettings.changeMode === 'confirm' ||
      quizSettings.changeMode === 'never') &&
    controllers.value.length === confirmedControllers.value.length
  ) {
    return true;
  }

  return false;
});

let showTimeoutId: NodeJS.Timeout | undefined;
watch(done, (val) => {
  clearTimeout(showTimeoutId);

  if (val) {
    setTimeout(() => {
      showResults.value = true;
    }, 1000);
  } else {
    showResults.value = false;
  }
});

const soundsEnabled = computed<boolean>(() => {
  return quizSettings.playSounds && !globalMuted.value;
});

const openSettings = () => {
  quasar.dialog({
    component: QuizQuestionDialog,
  });
};

const start = () => {
  countDownTime.value = quizSettings.answerTime;
  started.value = true;
};

const restart = () => {
  pressedButtons.value = new Map<string, BuzzerButton>();
  confirmedControllers.value = [];
  reset();

  started.value = false;
};
</script>

<style scoped></style>
