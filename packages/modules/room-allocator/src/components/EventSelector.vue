<script setup lang="ts">
import {computed, inject, watch} from "vue";
import Store from "../store";

const localStore = inject('localStore') as Store
const { state } = localStore

const events = computed(() => localStore.events.value)

watch([events], () => {
  if (events.value.length === 1) {
    localStore.setSelectedEvent(events.value[0])
  }
})
</script>

<template>
  <v-select
      v-if="events.length > 0"
      :model-value="state.selectedEvent ? state.selectedEvent.id : null"
      :items="events"
      name="event"
      placeholder="Select an Event"
      item-text="title"
      item-value="id"
      @update:model-value="localStore.setSelectedEvent($event)"
  />
</template>