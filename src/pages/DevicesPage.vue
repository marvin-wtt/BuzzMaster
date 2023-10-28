<template>
  <q-page padding class="row justify-center">
    <div class="column col-10">
      <div class="text-h4 text-center">Devices</div>
      <q-list>
        <q-expansion-item
          v-for="(dongle, index) in dongles"
          :key="dongle.name"
          group="dongles"
          :label="dongle.name"
          :default-opened="index === 0"
          expand-separator
        >
          <q-list>
            <q-item
              v-for="controller in dongle.controllers"
              :key="controller.name"
            >
                <q-item-section class="col col-shrink">
                  <q-icon name="circle" :color="getButtonColor(controller)" size="xs" />
                </q-item-section>

                <q-item-section class="col col-grow">
                  {{ controller.name }}
                </q-item-section>

              <q-item-section side>
                <q-btn
                  icon="search"
                  size="xs"
                  flat
                  round
                  @click="findDevice(controller)"
                />
              </q-item-section>
              <q-item-section side>
                <q-btn
                  icon="edit"
                  size="xs"
                  flat
                  round
                  @click="editControllerName(controller)"
                />
              </q-item-section>
              <q-item-section side>
                <q-btn
                  :icon="controller.disabled ? 'play_circle' : 'remove_circle_outline'"
                  size="xs"
                  flat
                  round
                  @click="controller.disabled = !controller.disabled"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import useBuzzer from 'src/composables/buzzer';
import {BuzzerButton, IController} from "src/composables/buzzer/types";
import {NamedColor, useQuasar} from "quasar";

const quasar = useQuasar();
const { dongles } = useBuzzer();

const findDevice = (controller: IController) => {
  let toggle = true;
  const intervalId = setInterval(() => {
    controller.setLight(toggle);
    toggle = !toggle;
  }, 500);

  setTimeout(() => {
    clearInterval(intervalId);
    controller.setLight(false);
  }, 5000);
};

const editControllerName = (controller: IController) => {
  quasar.dialog({
    title: 'Controller name',
    // message: 'Maximum 20 characters',
    prompt: {
      model: controller.name,
      isValid: val => val.length > 0 && val.length <= 20,
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk((name: string) => {
    controller.name = name;
  });
};

const getButtonColor = (controller: IController): NamedColor => {
  if (controller.buttons[BuzzerButton.RED]) {
    return 'red';
  }

  if (controller.buttons[BuzzerButton.BLUE]) {
    return 'blue';
  }

  if (controller.buttons[BuzzerButton.ORANGE]) {
    return 'orange';
  }

  if (controller.buttons[BuzzerButton.GREEN]) {
    return 'green';
  }

  if (controller.buttons[BuzzerButton.YELLOW]) {
    return 'yellow';
  }

  return 'grey';
}


</script>

<style scoped>
</style>
