<template>
  <q-page class="column">
    <div class="row col-shrink justify-between bg-primary text-white">
      <q-btn
        v-if="!props.hideBack"
        class="col-1"
        icon="arrow_back"
        size="md"
        rounded
        dense
        flat
        @click="navigateBack()"
      />
      <!-- TODO Why does spaces use multiple lines ??? -->
      <div
        class="col text-h5 text-center self-center"
        v-html="pageTitle"
      />
      <div class="col-1" />
    </div>

    <div
      class="col-grow row justify-center"
      :class="props.padding ? 'q-pa-md' : ''"
    >
      <slot />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();

interface Props {
  title: string;
  padding?: boolean;
  hideBack?: boolean;
  backTo?: string | object;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const navigateBack = () => {
  emit('back');

  if (props.backTo) {
    router.replace(props.backTo);
  } else {
    router.back();
  }
};

const pageTitle = computed(() => {
  return props.title.replace(/ /g, '&nbsp;');
});
</script>

<style scoped></style>
