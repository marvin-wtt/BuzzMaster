<template>
  <div class="column justify-center">
    <div class="text-center text-h1 q-pa-lg">Buzzer</div>

    <div class="text-h4 text-center q-pa-md">
      Press the red button to answer.
    </div>

    <controller-logo
      class="self-center"
      red
    />

    <q-separator />

    <div class="row justify-center text-h5">
      <q-list class="col-11">
        <q-item>
          <q-item-section avatar>
            <q-icon name="timer" />
          </q-item-section>
          <q-item-section>Answer time</q-item-section>
          <q-item-section side
            >{{ props.settings.answerTime }} s</q-item-section
          >
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="replay" />
          </q-item-section>
          <q-item-section>Attempts</q-item-section>
          <q-item-section side>
            <template v-if="props.settings.multipleAttempts">
              <q-icon name="all_inclusive" />
            </template>
            <template v-else> 1 </template>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon
              name="check"
              color="positive"
            />
          </q-item-section>
          <q-item-section>Correct</q-item-section>
          <q-item-section side>
            {{ props.settings.pointsCorrect }} pts
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon
              name="close"
              color="negative"
            />
          </q-item-section>
          <q-item-section>Wrong</q-item-section>
          <q-item-section side>
            {{ props.settings.pointsWrong }} pts
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ControllerLogo from 'components/ControllerLogo.vue';
import { BuzzerSettings } from 'app/common/gameSettings/BuzzerSettings';

const props = defineProps<{
  settings: BuzzerSettings;
}>();

// TODO Add i18n
</script>

<style scoped></style>
