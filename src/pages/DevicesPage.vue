<template>
  <q-page class="column">
    <div class="col-shrink row justify-between bg-primary text-white">
      <q-btn
        class="col-1"
        icon="arrow_back"
        size="md"
        rounded
        dense
        flat
        @click="navigateBack()"
      />
      <div class="col text-h5 text-center self-center">Devices</div>
      <div class="col-1" />
    </div>

    <q-separator />

    <div class="col row justify-center">
      <q-list
        class="col-10"
        separator
      >
        <!-- Dongles -->
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
                <q-icon
                  name="circle"
                  :color="getButtonColor(controller)"
                  size="xs"
                />
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
                  :icon="
                    controller.disabled
                      ? 'play_circle'
                      : 'remove_circle_outline'
                  "
                  size="xs"
                  flat
                  round
                  @click="controller.disabled = !controller.disabled"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <!-- Buzzer Test -->
        <q-item>
          <q-item-section> Test All Buzzers </q-item-section>
          <q-item-section side>
            <q-btn
              label="Start"
              outline
              rounded
              :disable="!hasEnabledController"
              @click="startBuzzerTest"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useBuzzer } from 'src/plugins/buzzer';
import { BuzzerButton, IController } from 'src/plugins/buzzer/types';
import { NamedColor, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import BuzzerTestDialog from 'components/devices/BuzzerTestDialog.vue';
import { computed } from 'vue';

const quasar = useQuasar();
const { dongles, reset } = useBuzzer();
const router = useRouter();

const navigateBack = () => {
  cancelFindDevice();
  router.back();
};

const findTimerId: {
  intervalId: NodeJS.Timeout;
  timeoutId: NodeJS.Timeout;
}[] = [];

const findDevice = (controller: IController) => {
  let toggle = true;
  const intervalId = setInterval(() => {
    controller.setLight(toggle);
    toggle = !toggle;
  }, 500);

  const timeoutId = setTimeout(() => {
    clearInterval(intervalId);
    controller.setLight(false);

    // Remove from list
    findTimerId.splice(findTimerId.indexOf(timerOptions), 1);
  }, 5000);

  // Add ids so the timers can be canceled externally
  const timerOptions = {
    intervalId,
    timeoutId,
  };
  findTimerId.push(timerOptions);
};

const cancelFindDevice = () => {
  findTimerId.forEach((value) => {
    clearInterval(value.intervalId);
    clearTimeout(value.timeoutId);
  });
  reset();
};

const hasEnabledController = computed<boolean>(() => {
  return dongles.value.some((dongle) => {
    return dongle.controllers.some((controller) => {
      return !controller.disabled;
    });
  });
});

const editControllerName = (controller: IController) => {
  quasar
    .dialog({
      title: 'Controller name',
      // message: 'Maximum 20 characters',
      prompt: {
        model: controller.name,
        isValid: (val) => val.length > 0 && val.length <= 20,
        type: 'text',
      },
      cancel: true,
      persistent: true,
    })
    .onOk((name: string) => {
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
};

const startBuzzerTest = () => {
  cancelFindDevice();

  quasar
    .dialog({
      component: BuzzerTestDialog,
    })
    .onOk(() => {
      reset();
    })
    .onCancel(() => {
      reset();
    })
    .onDismiss(() => {
      reset();
    });
};
</script>

<style scoped></style>
