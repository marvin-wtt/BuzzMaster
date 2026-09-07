<template>
  <component
    :is="to ? 'router-link' : 'button'"
    v-bind="to ? { to } : { type: 'button', disabled: disable }"
    class="bm-row"
    :class="{ 'bm-row--primary': primary }"
  >
    <span
      class="bm-row__tag"
      aria-hidden="true"
    />

    <q-icon
      v-if="icon"
      :name="icon"
      size="20px"
      class="bm-dim"
    />

    <span class="bm-row__body">
      <span class="bm-row__label">{{ label }}</span>
      <span
        v-if="caption"
        class="bm-row__caption"
        >{{ caption }}</span
      >
    </span>

    <span
      v-if="shortcut"
      class="bm-row__key"
      aria-hidden="true"
      >{{ shortcut }}</span
    >
  </component>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router';

/**
 * One line in a navigation list: colour tag, optional icon, label with an
 * optional caption, and the keyboard shortcut that triggers it. Renders as a
 * link when `to` is given and as a button otherwise.
 */
defineProps<{
  label: string;
  caption?: string;
  icon?: string;
  /** Key hint shown on the right. Bind the actual key via `useShortcuts`. */
  shortcut?: string;
  /** Marks the one action the host reaches for first on this screen. */
  primary?: boolean;
  to?: RouteLocationRaw;
  disable?: boolean;
}>();
</script>
