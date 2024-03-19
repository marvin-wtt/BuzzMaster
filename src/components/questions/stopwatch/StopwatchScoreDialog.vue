<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="min-width: 350px; width: 400px"
    >
      <q-card-section class="text-center text-h5">
        {{ t('question.stopwatch.scores.title') }}
      </q-card-section>

      <q-card-section>
        <q-list>
          <q-item
            v-for="(controller, index) in props.controllers"
            :key="controller.id"
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
              {{ controller.name }}
            </q-item-section>

            <q-item-section side>
              <q-input
                v-model.number="updatedScores[controller.id]"
                :label="t('question.stopwatch.scores.field')"
                type="number"
                outlined
                rounded
                dense
                clearable
                style="width: 100px"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('question.stopwatch.scores.action.ok')"
          color="primary"
          rounded
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { useI18n } from 'vue-i18n';
import { IController } from 'src/plugins/buzzer/types';
import { ref, toRaw } from 'vue';

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const { t } = useI18n();

const props = defineProps<{
  controllers: IController[];
  scores: Record<string, number | undefined>;
}>();

const updatedScores = ref<Record<string, number | undefined>>(
  structuredClone(toRaw(props.scores)),
);

defineEmits([...useDialogPluginComponent.emits]);

const avatarColor = (index: number) => {
  switch (index) {
    case 1:
      return 'primary';
    case 2:
      return 'secondary';
    case 3:
      return 'info';
  }

  return 'grey';
};

const onSave = () => {
  onDialogOK(updatedScores.value);
};
</script>

<style scoped></style>
