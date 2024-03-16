<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
  >
    <q-card
      class="q-dialog-plugin"
      style="max-width: 350px"
    >
      <q-card-section>
        <a class="text-h5">
          {{
            t('scoreboard.update.title', {
              name: props.score.name,
            })
          }}
        </a>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model.number="updatedValue"
          :error
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="t('scoreboard.update.action.cancel')"
          color="primary"
          rounded
          outline
          @click="onDialogCancel"
        />
        <q-btn
          :label="t('scoreboard.update.action.submit')"
          color="primary"
          rounded
          :disable="error"
          @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';
import { computed, ref } from 'vue';
import { Score } from 'stores/scoreboard-store';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  score: Score;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const { t } = useI18n();

const updatedValue = ref<number>(props.score.value);

const error = computed<boolean>(() => {
  return isNaN(updatedValue.value);
});

const submit = () => {
  onDialogOK(updatedValue.value);
};
</script>

<style scoped></style>
