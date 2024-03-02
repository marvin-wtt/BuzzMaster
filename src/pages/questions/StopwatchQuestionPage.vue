<template>
  <navigation-bar
    title="Stopwatch"
    padding
  >
    <div class="col-12 column justify-around no-wrap">
      <!-- Content -->
      <div class="col-grow row justify-center">
        <div
          v-if="started"
          class="column q-mb-sm"
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
          {{ controllers.length }} controllers ready!
        </div>
      </div>
      <!-- Actions -->
      <div class="col-2 column content-center">
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
        </div>

        <div
          class="col-12"
          v-else-if="completed"
        >
          <!-- First row -->
          <div class="row q-gutter-sm">
            <q-btn
              label="Quick Play"
              icon="fast_forward"
              color="primary"
              rounded
              @click="quickPlay()"
            />
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

        <div v-else>
          <q-btn
            label="Cancel"
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
  ButtonPressEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
const { controllers, reset, on, removeListener } = useBuzzer();

const counter = ref<number>(0);
const started = ref<boolean>(false);
const startTime = ref<number>(0);
const pressedControllers = ref<Map<IController, number>>(
  new Map<IController, number>()
);

onBeforeMount(() => {
  reset();
  on('press', listener);
});

onUnmounted(() => {
  removeListener('press', listener);
  reset();
});

const completed = computed<boolean>(() => {
  return controllers.value.length === pressedControllers.value.size;
});

const listener = (event: ButtonPressEvent) => {
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

  counter.value = time / 1000;
};

const restart = () => {
  reset();

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
