<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin">
      <q-card-section class="text-h5">
        {{ t('devices.restore.title') }}
      </q-card-section>
      <q-card-section>
        {{ t('devices.restore.description') }}
      </q-card-section>
      <q-card-section>
        <q-list separator>
          <q-expansion-item
            v-for="dongle in disconnectedDongles"
            :key="dongle.name"
            group="dongles"
            expand-separator
          >
            <template v-slot:header="{ expanded }">
              <q-item-section avatar>
                <q-radio
                  v-model="selected"
                  :val="dongle"
                  :aria-label="t('devices.restore.action.select')"
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
                  @click.stop="dongle.find()"
                >
                  <q-tooltip>
                    {{ t('devices.item.dongle.find') }}
                  </q-tooltip>
                </q-btn>
              </q-item-section>
            </template>
            <template v-slot:default>
              <q-list>
                <q-item
                  v-for="controller in dongle.controllers"
                  :key="controller.name"
                  :inset-level="0.5"
                >
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
                      @click="controller.find()"
                    >
                      <q-tooltip>
                        {{ t('devices.item.controller.find') }}
                      </q-tooltip>
                    </q-btn>
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </q-expansion-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn
          :label="t('devices.restore.action.cancel')"
          outline
          rounded
          @click="onDialogCancel"
        />
        <q-btn
          :label="t('devices.restore.action.restore')"
          :disable="selected === undefined"
          color="primary"
          rounded
          @click="onDialogOK(selected)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useBuzzer } from 'src/plugins/buzzer';
import { ref } from 'vue';
import type { IDongle } from 'src/plugins/buzzer/types';

defineEmits([...useDialogPluginComponent.emits]);

const { disconnectedDongles } = useBuzzer();
const { t } = useI18n();
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const selected = ref<IDongle | undefined>();
</script>

<style scoped></style>
