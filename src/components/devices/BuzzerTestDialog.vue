<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="width: 80vw"
    >
      <q-card-section>
        <div class="text-h6 text-center">
          {{ t('devices.test.title') }}
        </div>
      </q-card-section>

      <q-card-section
        style="max-height: 50vh"
        class="scroll"
      >
        <q-list>
          <q-item
            v-for="controller in controllers"
            :key="controller.name"
          >
            <q-item-section>
              <q-item-label
                class="ellipsis text-body1"
                :class="
                  pressedButtons[controller.id]?.length === 5 ? 'text-grey' : ''
                "
              >
                {{ controller.name }}
              </q-item-label>
            </q-item-section>

            <q-item-section
              v-for="button in buttons"
              :key="button"
              side
            >
              <q-icon
                :color="buttonColorClass(controller, button)"
                name="circle"
                size="xs"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section class="text-center">
        {{ doneControllers }} / {{ controllers.length }}

        <q-linear-progress
          rounded
          stripe
          :color="progressColor"
          size="10px"
          :value="buttonsDone"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="buttonLabel"
          :outline="!done"
          rounded
          :color="progressColor"
          @click="close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import {
  ButtonEvent,
  BuzzerButton,
  IController,
} from 'src/plugins/buzzer/types';
import { useBuzzer } from 'src/plugins/buzzer';
import { computed, onMounted, onUnmounted, reactive } from 'vue';
import { buzzerButtonColor } from 'components/buttonColors';
import { useI18n } from 'vue-i18n';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

const { t } = useI18n();
const { controllers, buzzer } = useBuzzer();

onMounted(() => {
  buzzer.reset();

  buzzer.on('press', listener);
});

onUnmounted(() => {
  buzzer.removeListener('press', listener);
});

const pressedButtons: Record<string, BuzzerButton[]> = reactive({});

const buttonLabel = computed<string>(() => {
  return done.value
    ? t('devices.test.action.complete')
    : t('devices.test.action.cancel');
});

const progressColor = computed<string>(() => {
  return done.value ? 'positive' : 'primary';
});

const listener = (event: ButtonEvent) => {
  if (!pressedButtons[event.controller.id]) {
    pressedButtons[event.controller.id] = [];
  }

  if (!pressedButtons[event.controller.id].includes(event.button)) {
    pressedButtons[event.controller.id].push(event.button);
    // Turn on light
    if (pressedButtons[event.controller.id].length === 5) {
      event.controller.setLight(true);
    }
  }
};

const close = () => {
  if (done.value) {
    onDialogOK();
  } else {
    onDialogCancel();
  }
};

const doneControllers = computed<number>(() => {
  return controllers.value
    .map((controller) => pressedButtons[controller.id]?.length === 5)
    .reduce((acc, val) => (val ? acc + 1 : acc), 0);
});

const buttonsDone = computed<number>(() => {
  const total = controllers.value.length * 5;
  const active = controllers.value
    .map((controller) => pressedButtons[controller.id]?.length ?? 0)
    .reduce((acc, val) => acc + val, 0);
  return active / total;
});

const done = computed<boolean>(() => {
  return buttonsDone.value === 1;
});

const buttonColorClass = (controller: IController, button: BuzzerButton) => {
  return pressedButtons[controller.id]?.includes(button)
    ? buzzerButtonColor[button]
    : 'grey';
};

// Order of buttons
const buttons: BuzzerButton[] = [
  BuzzerButton.RED,
  BuzzerButton.BLUE,
  BuzzerButton.ORANGE,
  BuzzerButton.GREEN,
  BuzzerButton.YELLOW,
];
</script>

<style scoped></style>
