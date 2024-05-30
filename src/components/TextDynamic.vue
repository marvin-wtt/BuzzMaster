<template>
  <q-resize-observer @resize="onCircleTimerResize" />

  <div class="column justify-center q-col-gutter-xs">
    <div :style="nameStyle">
      {{ props.name }}
    </div>

    <div :style="slotStyle">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

interface Size {
  width: number;
  height: number;
}

type ElementStyle =
  | string
  | {
      fontSize: string;
    };

const props = withDefaults(
  defineProps<{
    name?: string;
    nameScale?: number;
    slotScale?: number;
    heightFactor?: number;
  }>(),
  {
    nameScale: 8.5,
    heightFactor: 3,
    slotScale: 0.75,
  },
);

const circleSize = ref<Size>();
const nameStyle = ref<ElementStyle>('');
const slotStyle = ref<ElementStyle>('');

// Measure normal text width
const canvas = document.createElement('canvas');
const textMetrics = (text: string) => {
  // Canvas is not present in testing environment.
  // This is a workaround until either canvas is added or a simple stub is found
  if (!('getContext' in canvas)) {
    return { width: 0, height: 0 };
  }
  const context = canvas.getContext('2d');
  if (context === null) {
    return { width: 0, height: 0 };
  }
  context.font = '12pt arial';
  const metrics = context.measureText(text);
  const height =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

  return {
    width: metrics.width,
    height,
  };
};

const onCircleTimerResize = (size?: { width: number; height: number }) => {
  size ??= circleSize.value ?? { width: 0, height: 0 };
  const elementWidth = size.width;
  const name = props.name;

  // Magical numbers so that the font size stays within the circle with padding

  const { width, height } = textMetrics(name ?? '');
  if (!elementWidth || !name) {
    return;
  }

  let scale = elementWidth / width;
  // Rescale for height if the height outgrows the circle
  if (height * props.heightFactor * scale > elementWidth) {
    scale = elementWidth / (height * props.heightFactor);
  }

  const fontSize = props.nameScale * scale;
  nameStyle.value = {
    fontSize: `${fontSize}pt`,
  };

  const countDownFontSize = fontSize * props.slotScale;
  slotStyle.value = {
    fontSize: `${countDownFontSize}pt`,
  };
};

watchEffect(() => {
  onCircleTimerResize();
});
</script>

<style scoped></style>
