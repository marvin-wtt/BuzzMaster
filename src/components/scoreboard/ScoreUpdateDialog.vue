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
        <a class="text-h5 ellipsis">
          {{
            t('scoreboard.update.title', {
              name: props.score.name,
            })
          }}
        </a>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="inputValue"
          :label="t('scoreboard.update.field.label')"
          :hint="t('scoreboard.update.field.hint', { score: roundedScore })"
          outlined
          rounded
          :error
        >
          <template #prepend>
            <q-icon
              :name="iconName"
              class="cursor-pointer"
              @click="toggleUpdateMode"
            />
          </template>
        </q-input>
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

const inputValue = ref<string>();
const replaceMode = ref<boolean>(false);

const error = computed<boolean>(() => {
  return (
    numericInput.value === undefined ||
    (!!replaceMode.value && !!operand.value) ||
    (operand.value === '/' && numericInput.value === 0)
  );
});

const numericInput = computed<number | undefined>(() => {
  const n = operand.value ? inputValue.value?.substring(1) : inputValue.value;
  if (n === undefined) {
    return undefined;
  }

  const number = parseFloat(n);

  return isNaN(number) ? undefined : number;
});

const operand = computed<'*' | '/' | undefined>(() => {
  const str = inputValue.value;
  if (!str || str.length === 0) {
    return undefined;
  }

  const op = str.charAt(0);
  if (op === '*' || op === '/') {
    return op;
  }

  return undefined;
});

const iconName = computed<string>(() => {
  return replaceMode.value ? 'edit' : 'o_calculate';
});

const resultingScore = computed<number | undefined>(() => {
  const n = numericInput.value;
  if (n === undefined) {
    return undefined;
  }

  if (replaceMode.value) {
    return n;
  }

  const op = operand.value;
  if (op === '*') {
    return props.score.value * n;
  }

  if (op === '/') {
    return props.score.value / n;
  }

  return props.score.value + n;
});

const roundedScore = computed<number | undefined>(() => {
  return resultingScore.value !== undefined
    ? round(resultingScore.value)
    : undefined;
});
const toggleUpdateMode = () => {
  replaceMode.value = !replaceMode.value;
};

const round = (n: number): number => {
  return Math.round(n * 1e3) / 1e3;
};

const submit = () => {
  onDialogOK(roundedScore.value ?? props.score.value);
};
</script>

<style scoped></style>
