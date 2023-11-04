<template>
  <transition
    mode="out-in"
    name="fade"
  >
    <slot />
  </transition>
</template>

<script lang="ts" setup></script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
