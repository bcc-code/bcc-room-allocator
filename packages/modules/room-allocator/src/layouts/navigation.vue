<script setup lang="ts">
import {computed, inject, ref} from "vue";
import Draggable from "vueDraggable";
import Store from "../store";
import Registration from "../components/Registration.vue";
import NavDetail from "./nav-detail.vue";
import { Event } from "../types";

const localStore = inject('localStore') as Store
const { state } = localStore

const loading = ref(false);
const noRoom = computed({
  get() {
    return localStore.registrations.value?.filter(r => r.room === 999999)
      .sort((a,b) => a[state.sortBy] > b[state.sortBy] ? 1 : -1);
  },
  set(value) {
    loading.value = true
    Promise.all(value.map(async reg => {
      if (reg.room !== 999999) {
        await localStore.setRoom(reg.id, 999999)
      }
    })).then(() => loading.value = false)
  }
})

const boys = computed(() => localStore.registrations.value?.filter(r => r.gender === 'male' && !r.room)
    .sort((a,b) => a[state.sortBy] > b[state.sortBy] ? 1 : -1)
);
const girls = computed(() => localStore.registrations.value?.filter(r => r.gender === 'female' && !r.room)
    .sort((a,b) => a[state.sortBy] > b[state.sortBy] ? 1 : -1)
);

const eventDate = computed(() => {
  const event: Event | null = state.selectedEvent
  if (! (event?.start_date && event?.end_date)) {
    return null
  }

  return {
    start: new Date(event.start_date).toDateString(),
    end: new Date(event.end_date).toDateString()
  }
})
</script>

<template>
  <div class="p-4" v-if="state.selectedEvent">
    <h3 class="text-lg leading-tight mb-2">
      {{state.selectedEvent.title}}
      <br/>{{state.selectedGroup ? state.selectedGroup.name : ''}}
    </h3>
    <template v-if="eventDate">
      <p>Start: {{ eventDate.start }}</p>
      <p>End: {{ eventDate.end }}</p>
    </template>
  </div>

  <v-notice v-if="state.errors.length > 0">
    <ul class="list-disc">
      <li v-for="error in state.errors">{{ error }}</li>
    </ul>
  </v-notice>

  <v-button v-if="localStore.selection.value.length" @click="() => localStore.clearFromRoom()" tile secondary full-width outline>
    <v-icon name="undo" class="mr-2" />Remove
  </v-button>

  <nav-detail icon="other_houses" :title="`No room (${noRoom ? noRoom.length : 0})`">
    <v-progress-linear v-if="loading" indeterminate />
    <Draggable
      style="min-height: 2rem"
      v-model="noRoom"
      group="people"
      itemKey="id"
      handle=".handle"
    >
      <template #item="{ element, index }">
        <Registration v-bind="element" :key="element.id" :can-edit="true" />
      </template>
    </Draggable>
  </nav-detail>

  <nav-detail icon="male" :title="`Boys (${boys ? boys.length : 0})`">
    <Draggable v-if="boys && boys.length"
      class="boys-list"
      :list="boys"
      group="people"
      itemKey="id"
      handle=".handle"
    >
      <template #item="{ element, index }">
        <Registration v-bind="element" :key="element.id" :can-edit="true" />
      </template>
    </Draggable>
  </nav-detail>

  <nav-detail icon="female" :title="`Girls (${girls ? girls.length : 0})`">
    <Draggable v-if="girls && girls.length"
      class="girls-list"
      :list="girls"
      group="people"
      itemKey="id"
      handle=".handle"
    >
      <template #item="{ element, index }">
        <Registration v-bind="element" :key="element.id" :can-edit="true" />
      </template>
    </Draggable>
  </nav-detail>
</template>