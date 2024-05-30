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
            t('leaderboard.update.title', {
              name: props.entry.name,
            })
          }}
        </a>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="inputValue"
          :label="t('leaderboard.update.field.label')"
          :hint="t('leaderboard.update.field.hint', { points: roundedPoints })"
          :prefix="inputPrefix"
          outlined
          rounded
          :error
          :errorMessage
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
          :label="t('leaderboard.update.action.cancel')"
          color="primary"
          rounded
          outline
          @click="onDialogCancel"
        />
        <q-btn
          :label="t('leaderboard.update.action.submit')"
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
import { useI18n } from 'vue-i18n';
import { LeaderboardEntry } from 'app/common/gameState/LeaderboardState';

const props = defineProps<{
  entry: LeaderboardEntry;
}>();

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
const { t } = useI18n();

const inputValue = ref<string>(' ');
const replaceMode = ref<boolean>(false);

const error = computed<boolean>(() => {
  return errorMessage.value !== undefined;
});

const errorMessage = computed<string | undefined>(() => {
  if (numericInput.value === undefined) {
    return t('leaderboard.update.rule.onlyNumbers');
  }

  if (!replaceMode.value && operand.value === undefined) {
    return t('leaderboard.update.rule.missingOperand');
  }

  if (operand.value === '/' && numericInput.value === 0) {
    return t('leaderboard.update.rule.divZero');
  }

  return undefined;
});

const inputPrefix = computed<string | undefined>(() => {
  return replaceMode.value ? undefined : props.entry.value + ' ';
});

const iconName = computed<string>(() => {
  return replaceMode.value ? 'edit' : 'o_calculate';
});

const numericInput = computed<number | undefined>(() => {
  const n = operand.value ? inputValue.value?.substring(1) : inputValue.value;
  if (n === undefined) {
    return undefined;
  }

  const number = parseFloat(n);

  return isNaN(number) ? undefined : number;
});

type Operand = '*' | '/' | '+' | '-';
const operand = computed<Operand | undefined>(() => {
  const str = inputValue.value;
  if (str === undefined || str.length === 0) {
    return undefined;
  }

  const op = str.charAt(0);
  if (!['*', '/', '+', '-'].includes(op)) {
    return undefined;
  }

  return op as Operand;
});

const resultingPoints = computed<number | undefined>(() => {
  if (replaceMode.value) {
    return numericInput.value;
  }

  if (numericInput.value === undefined) {
    return undefined;
  }

  const op = operand.value;
  switch (op) {
    case '+':
      return props.entry.value + numericInput.value;
    case '-':
      return props.entry.value - numericInput.value;
    case '*':
      return props.entry.value * numericInput.value;
    case '/':
      return props.entry.value / numericInput.value;
    default:
      return undefined;
  }
});

const roundedPoints = computed<number | undefined>(() => {
  return resultingPoints.value !== undefined
    ? round(resultingPoints.value)
    : undefined;
});
const toggleUpdateMode = () => {
  replaceMode.value = !replaceMode.value;
};

const round = (n: number): number => {
  return Math.round(n * 1e3) / 1e3;
};

const submit = () => {
  onDialogOK(roundedPoints.value ?? props.entry.value);
};
</script>

<style scoped></style>
