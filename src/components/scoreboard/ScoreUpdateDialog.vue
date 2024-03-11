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
        <a class="text-h5">Update {{ props.score.name }}</a>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model.number="updatedValue"
          :error
          :error-message="errorMessage"
        />
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Cancel"
          color="primary"
          rounded
          outline
          @click="onDialogCancel"
        />
        <q-btn
          label="Update"
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

const props = defineProps<{
  score: Score;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const updatedValue = ref<number>(props.score.value);

const error = computed<boolean>(() => {
  return !Number.isInteger(updatedValue.value);
});

const errorMessage = computed<string | null>(() => {
  if (!error.value) {
    return 'Value must be an integer';
  }

  return null;
});

const submit = () => {
  onDialogOK(updatedValue.value);
};
</script>

<style scoped></style>
