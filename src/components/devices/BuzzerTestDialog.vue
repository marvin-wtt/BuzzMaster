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
        <div class="text-h6 text-center">Test Controllers</div>
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
                :class="
                  pressedButtons[controller.id]?.length === 5 ? 'text-grey' : ''
                "
              >
                <a
                  :class="
                    controller.name.length > 15 ? 'text-body2' : 'text-body1'
                  "
                >
                  {{ controller.name }}
                </a>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon
                name="circle"
                :color="
                  pressedButtons[controller.id]?.includes(BuzzerButton.RED)
                    ? 'red'
                    : 'grey'
                "
                size="xs"
              />
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="circle"
                :color="
                  pressedButtons[controller.id]?.includes(BuzzerButton.BLUE)
                    ? 'blue'
                    : 'grey'
                "
                size="xs"
              />
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="circle"
                :color="
                  pressedButtons[controller.id]?.includes(BuzzerButton.ORANGE)
                    ? 'orange'
                    : 'grey'
                "
                size="xs"
              />
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="circle"
                :color="
                  pressedButtons[controller.id]?.includes(BuzzerButton.GREEN)
                    ? 'green'
                    : 'grey'
                "
                size="xs"
              />
            </q-item-section>
            <q-item-section side>
              <q-icon
                name="circle"
                :color="
                  pressedButtons[controller.id]?.includes(BuzzerButton.YELLOW)
                    ? 'yellow'
                    : 'grey'
                "
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
          :color="done ? 'positive' : 'primary'"
          size="10px"
          :value="buttonsDone"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="done ? 'Done' : 'Cancel'"
          :outline="!done"
          rounded
          :color="done ? 'positive' : 'primary'"
          @click="close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { ButtonPressEvent, BuzzerButton } from 'src/plugins/buzzer/types';
import { useBuzzer } from 'src/plugins/buzzer';
import { computed, onMounted, onUnmounted, reactive } from 'vue';

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

const { controllers, reset, onButtonPressed, removeListener } = useBuzzer();

onMounted(() => {
  reset();

  onButtonPressed(listener);
});

onUnmounted(() => {
  removeListener('press', listener);
});

const pressedButtons: Record<string, BuzzerButton[]> = reactive({});

const listener = (event: ButtonPressEvent) => {
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
</script>

<style scoped></style>
