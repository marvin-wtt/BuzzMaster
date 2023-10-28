<template>
  <q-page padding class="row justify-center">
    <div class="column">
      <div class="text-h2">Devices</div>
      <q-list>
        <q-expansion-item
          v-for="(dongle, index) in dongles"
          :key="dongle.name"
          group="dongles"
          :label="dongle.name"
          :default-opened="index === 0"
        >
          <q-list>
            <q-item
              v-for="controller in dongle.controllers"
              :key="controller.name"
            >
              <q-item-section>
                {{ controller.name }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import useBuzzer from 'src/composables/buzzer';

const { dongles } = useBuzzer();
</script>
