<template>
  <q-page class="row justify-center">
    <q-list
      class="col-10"
      separator
    >
      <!-- Dongles -->
      <q-expansion-item
        v-for="dongle in dongles"
        :key="dongle.name"
        group="dongles"
        expand-separator
      >
        <template v-slot:header="{ expanded }">
          <q-item-section
            v-if="!expanded"
            class="col col-shrink"
          >
            <q-icon
              name="circle"
              :color="getDongleColor(dongle)"
              size="xs"
            />
          </q-item-section>
          <q-item-section class="col col-grow">
            <q-item-label>
              {{ dongle.name }}
            </q-item-label>
          </q-item-section>
          <q-item-section
            v-if="!expanded"
            side
          >
            <q-btn
              icon="search"
              size="xs"
              flat
              round
              @click.stop="findDongle(dongle)"
            />
          </q-item-section>
        </template>
        <template v-slot:default>
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
                <q-item-label>
                  {{ controller.name }}
                </q-item-label>
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
        </template>
      </q-expansion-item>

      <!-- No entries -->
      <q-item v-if="dongles.length === 0">
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ t('devices.item.noEntries.label') }}
            </q-item-label>
            <q-item-label caption>
              {{ t('devices.item.noEntries.caption') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-item>

      <!-- Missing controllers hint -->
      <q-item v-if="quasar.platform.is.win">
        <q-item-section>
          <q-item-label>
            {{ t('devices.item.missing.label') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="question_mark"
            :aria-label="t('devices.item.missing.button')"
            outline
            round
            dense
            @click="showMissingDongleHelp"
          />
        </q-item-section>
      </q-item>

      <!-- Buzzer Test -->
      <q-item v-if="dongles.length > 0">
        <q-item-section>
          <q-item-label>
            {{ t('devices.item.test.label') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            :label="t('devices.item.test.button')"
            outline
            rounded
            :disable="!hasEnabledController"
            @click="startBuzzerTest"
          />
        </q-item-section>
      </q-item>

      <!-- Dongle naming -->
      <q-item v-else>
        <q-item-section>
          <q-item-label>
            {{ t('devices.item.names.label') }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            :label="t('devices.item.names.button')"
            outline
            rounded
            @click="updateDongleNamingList"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script lang="ts" setup>
import { useBuzzer } from 'src/plugins/buzzer';
import {
  BuzzerButton,
  type IController,
  type IDongle,
} from 'src/plugins/buzzer/types';
import { type NamedColor, useQuasar } from 'quasar';
import BuzzerTestDialog from 'components/devices/BuzzerTestDialog.vue';
import { computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import DongleNameImportDialog from 'components/devices/DongleNameImportDialog.vue';
import { Dongle } from 'src/plugins/buzzer/Dongle';
import { config } from 'src/config';
import DongleMissingDialog from 'components/devices/DongleMissingDialog.vue';

const quasar = useQuasar();
const { t } = useI18n();
const { dongles, buzzer } = useBuzzer();

onUnmounted(async () => {
  await cancelFindDevice();
});

const FIND_DEVICE_INTERVAL = 500;
const FIND_DEVICE_TIMEOUT = 5000;

let findTimerId:
  | {
      intervalId: NodeJS.Timeout;
      timeoutId: NodeJS.Timeout;
    }
  | undefined = undefined;

const findDevice = async (controller: IController) => {
  await cancelFindDevice();
  let toggle = true;
  const intervalId = setInterval(() => {
    controller.setLight(toggle);
    toggle = !toggle;
  }, FIND_DEVICE_INTERVAL);

  const timeoutId = setTimeout(() => {
    clearInterval(intervalId);
    controller.setLight(false);

    // Remove from list
    findTimerId = undefined;
  }, FIND_DEVICE_TIMEOUT);

  // Add ids so the timers can be canceled externally
  findTimerId = {
    intervalId,
    timeoutId,
  };
};

const findDongle = async (dongle: IDongle) => {
  await cancelFindDevice();
  let toggle = true;
  const intervalId = setInterval(() => {
    dongle.controllers.forEach((controller) => controller.setLight(toggle));
    toggle = !toggle;
  }, FIND_DEVICE_INTERVAL);

  const timeoutId = setTimeout(() => {
    clearInterval(intervalId);
    dongle.controllers.forEach((controller) => controller.setLight(false));

    // Remove from list
    findTimerId = undefined;
  }, FIND_DEVICE_TIMEOUT);

  // Add ids so the timers can be canceled externally
  findTimerId = {
    intervalId,
    timeoutId,
  };
};

const cancelFindDevice = async () => {
  if (!findTimerId) {
    return;
  }

  clearInterval(findTimerId.intervalId);
  clearTimeout(findTimerId.timeoutId);
  await buzzer.reset();
};

const hasEnabledController = computed<boolean>(() => {
  return dongles.some((dongle) => {
    return dongle.controllers.some((controller) => {
      return !controller.disabled;
    });
  });
});

const editControllerName = (controller: IController) => {
  const maxLength = config.controllerNameMaxLength;
  quasar
    .dialog({
      title: t('devices.edit.title'),
      color: 'primary',
      // message: 'Maximum 20 characters',
      prompt: {
        model: controller.name,
        isValid: (val) => val.length > 0 && val.length <= maxLength,
        type: 'text',
      },
      ok: {
        label: t('devices.edit.action.ok'),
        rounded: true,
      },
      cancel: {
        label: t('devices.edit.action.cancel'),
        rounded: true,
        outline: true,
      },
    })
    .onOk((name: string) => {
      controller.name = name;
    });
};

const getDongleColor = (dongle: IDongle): NamedColor => {
  const pressed = dongle.controllers
    .flatMap((controller: IController) => Object.values(controller.buttons))
    .some((pressed: boolean) => pressed);

  return pressed ? 'red' : 'grey';
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

const startBuzzerTest = async () => {
  await cancelFindDevice();

  quasar
    .dialog({
      component: BuzzerTestDialog,
    })
    .onDismiss(() => {
      buzzer.reset().catch((reason) => {
        console.error(`Failed to reset buzzer: ${reason}  `);
      });
    });
};

const updateDongleNamingList = () => {
  quasar
    .dialog({
      component: DongleNameImportDialog,
    })
    .onOk((names: string[]) => {
      Dongle.CONTROLLER_NAMES = names;
    });
};

const showMissingDongleHelp = () => {
  quasar.dialog({
    component: DongleMissingDialog,
  });
};
</script>

<style scoped></style>
