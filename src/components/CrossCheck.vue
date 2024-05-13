<template>
  <template v-if="props.symbol === 'check'">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130.2 130.2"
    >
      <circle
        class="path circle"
        fill="none"
        :stroke="colors.check"
        stroke-width="6"
        stroke-miterlimit="10"
        cx="65.1"
        cy="65.1"
        r="62.1"
      />
      <polyline
        class="path check"
        fill="none"
        :stroke="colors.check"
        stroke-width="6"
        stroke-linecap="round"
        stroke-miterlimit="10"
        points="100.2,40.2 51.5,88.8 29.8,67.5 "
      />
    </svg>
  </template>

  <template v-else>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 130.2 130.2"
    >
      <circle
        class="path circle"
        fill="none"
        :stroke="colors.cross"
        stroke-width="6"
        stroke-miterlimit="10"
        cx="65.1"
        cy="65.1"
        r="62.1"
      />
      <line
        class="path line"
        fill="none"
        :stroke="colors.cross"
        stroke-width="6"
        stroke-linecap="round"
        stroke-miterlimit="10"
        x1="34.4"
        y1="37.9"
        x2="95.8"
        y2="92.3"
      />
      <line
        class="path line"
        fill="none"
        :stroke="colors.cross"
        stroke-width="6"
        stroke-linecap="round"
        stroke-miterlimit="10"
        x1="95.8"
        y1="38"
        x2="34.4"
        y2="92.2"
      />
    </svg>
  </template>
</template>

<script lang="ts" setup>
const props = defineProps<{
  symbol: 'check' | 'cross';
}>();

const colors = {
  check: '#73AF55',
  cross: '#f40c22',
};
</script>

<style scoped>
svg {
  width: 100px;
  display: block;
  margin: 40px auto 0;
}

.path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  &.circle {
    -webkit-animation: dash 0.9s ease-in-out;
    animation: dash 0.9s ease-in-out;
  }
  &.line {
    stroke-dashoffset: 1000;
    -webkit-animation: dash 0.9s 0.35s ease-in-out forwards;
    animation: dash 0.9s 0.35s ease-in-out forwards;
  }
  &.check {
    stroke-dashoffset: -100;
    -webkit-animation: dash-check 0.9s 0.35s ease-in-out forwards;
    animation: dash-check 0.9s 0.35s ease-in-out forwards;
  }
}

@-webkit-keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@-webkit-keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}

@keyframes dash-check {
  0% {
    stroke-dashoffset: -100;
  }
  100% {
    stroke-dashoffset: 900;
  }
}
</style>
