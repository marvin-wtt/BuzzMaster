<template>
  <q-page class="column no-wrap q-pa-md">
    <div class="bm-devices column q-gutter-y-sm">
      <!-- Dongles -->
      <q-expansion-item
        v-for="dongle in dongles"
        :key="dongle.name"
        class="bm-panel overflow-hidden"
        group="dongles"
        header-class="bm-devices__header"
      >
        <template v-slot:header="{ expanded }">
          <q-item-section
            v-if="!expanded"
            class="col-shrink"
          >
            <q-icon
              name="circle"
              :color="getDongleColor(dongle)"
              size="xs"
            />
          </q-item-section>

          <q-item-section class="col-grow">
            <q-item-label class="text-weight-medium">
              {{ dongle.name }}
            </q-item-label>
            <q-item-label
              caption
              class="bm-dim"
            >
              {{ t('toolbar.status.controllers', dongle.controllers.length) }}
            </q-item-label>
          </q-item-section>

          <q-item-section
            v-if="!expanded"
            side
          >
            <q-btn
              icon="search"
              size="sm"
              flat
              round
              @click.stop="dongle.find()"
            >
              <q-tooltip>
                {{ t('devices.item.dongle.find') }}
              </q-tooltip>
            </q-btn>
          </q-item-section>

          <q-item-section
            v-if="disconnectedDongles.length > 0"
            side
          >
            <q-btn
              icon="history"
              size="sm"
              flat
              round
              @click.stop="onRestoreDongle(dongle)"
            >
              <q-tooltip>
                {{ t('devices.item.dongle.history') }}
              </q-tooltip>
            </q-btn>
          </q-item-section>
        </template>

        <template v-slot:default>
          <div class="bm-devices__controllers column q-gutter-y-xs">
            <div
              v-for="controller in dongle.controllers"
              :key="controller.name"
              class="bm-row"
              :class="{ 'bm-devices__row--off': controller.disabled }"
            >
              <!-- Lights up in the colour of whatever button is held down,
                   so a controller can be identified without looking away. -->
              <q-icon
                name="circle"
                :color="getButtonColor(controller)"
                size="xs"
              />

              <span class="bm-row__body">
                <span class="bm-row__label">{{ controller.name }}</span>
              </span>

              <q-btn
                icon="search"
                size="sm"
                flat
                round
                dense
                @click="controller.find()"
              >
                <q-tooltip>
                  {{ t('devices.item.controller.find') }}
                </q-tooltip>
              </q-btn>

              <q-btn
                icon="edit"
                size="sm"
                flat
                round
                dense
                @click="editControllerName(controller)"
              >
                <q-tooltip>
                  {{ t('devices.item.controller.edit') }}
                </q-tooltip>
              </q-btn>

              <q-btn
                :icon="
                  controller.disabled ? 'play_circle' : 'remove_circle_outline'
                "
                size="sm"
                flat
                round
                dense
                @click="controller.disabled = !controller.disabled"
              >
                <q-tooltip>
                  {{
                    controller.disabled
                      ? t('devices.item.controller.enable')
                      : t('devices.item.controller.disable')
                  }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
      </q-expansion-item>

      <!-- No entries -->
      <div
        v-if="dongles.length === 0"
        class="bm-panel bm-devices__empty column items-center text-center q-gutter-y-xs"
      >
        <q-icon
          name="usb_off"
          size="30px"
          class="bm-dim"
        />
        <div class="text-weight-medium">
          {{ t('devices.item.noEntries.label') }}
        </div>
        <div class="text-caption bm-dim">
          {{ t('devices.item.noEntries.caption') }}
        </div>
      </div>

      <!-- Missing controllers hint -->
      <div
        v-if="quasar.platform.is.win || !quasar.platform.is.electron"
        class="bm-panel bm-devices__action"
      >
        <span class="col">{{ t('devices.item.missing.label') }}</span>

        <q-btn
          v-if="quasar.platform.is.win"
          :label="t('devices.item.missing.help')"
          outline
          no-caps
          size="sm"
          @click="showMissingDongleHelp"
        />

        <q-btn
          v-if="!quasar.platform.is.electron"
          :label="t('devices.item.missing.add')"
          outline
          no-caps
          size="sm"
          @click="requestDevicePermissions"
        />
      </div>

      <!-- Buzzer Test -->
      <div
        v-if="dongles.length > 0"
        class="bm-panel bm-devices__action"
      >
        <span class="col">{{ t('devices.item.test.label') }}</span>

        <q-btn
          :label="t('devices.item.test.button')"
          outline
          no-caps
          size="sm"
          :disable="!hasEnabledController"
          @click="startBuzzerTest"
        />
      </div>

      <!-- Dongle naming -->
      <div
        v-else
        class="bm-panel bm-devices__action"
      >
        <span class="col">{{ t('devices.item.names.label') }}</span>

        <q-btn
          :label="t('devices.item.names.button')"
          outline
          no-caps
          size="sm"
          @click="updateDongleNamingList"
        />
      </div>
    </div>
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
import DongleRestoreDialog from 'components/devices/DongleRestoreDialog.vue';
import { requestBuzzerDevicePermissions } from 'src/plugins/buzzer/permission';

const quasar = useQuasar();
const { t } = useI18n();
const { dongles, buzzer, disconnectedDongles, restoreDongle } = useBuzzer();

onUnmounted(async () => {
  await buzzer.reset();
});

const onRestoreDongle = (dongle: IDongle) => {
  quasar
    .dialog({
      component: DongleRestoreDialog,
    })
    .onOk((selectedDongle: IDongle) => {
      restoreDongle(selectedDongle, dongle);
    });
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
  await buzzer.reset();

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

const requestDevicePermissions = async () => {
  await requestBuzzerDevicePermissions();
};
</script>

<style lang="scss" scoped>
.bm-devices {
  width: 100%;
  max-width: 460px;
  align-self: center;
}

.bm-devices :deep(.bm-devices__header) {
  padding: 8px 12px;
  min-height: 0;
}

.bm-devices__controllers {
  padding: 0 8px 8px;
}

.bm-devices__row--off {
  opacity: 0.5;
}

.bm-devices__empty {
  padding: 26px 18px;
}

.bm-devices__action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 0.875rem;
}
</style>
