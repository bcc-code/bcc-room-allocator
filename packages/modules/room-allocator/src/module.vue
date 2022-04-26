<script setup lang="ts">
import {computed, provide, ref} from "vue";
import Draggable from "vueDraggable";
import Store from "./store";
import {useApi} from "@directus/extensions-sdk";
import type {Room} from "./types";
import Sidebar from "./layouts/sidebar.vue";
import Actions from "./layouts/actions.vue";
import Navigation from "./layouts/navigation.vue";
import DraggableRoom from "./components/Room.vue";
import DatesSelector from "./components/DatesSelector.vue";
import EventSelector from "./components/EventSelector.vue";
import GroupSelector from "./components/GroupSelector.vue";

const api = useApi();

const localStore = new Store()
provide('localStore', localStore)

const { state } = localStore

const currentRoom = ref<Room | null>(null)

const rooms = computed(() => {
  localStore.rooms.value.sort((a, b) => a.gender.localeCompare(b.gender))
  if (state.showBoyRooms && state.showGirlRooms) {
    return localStore.rooms.value
  }

  if (state.showBoyRooms) {
    return localStore.rooms.value.filter(room => !room.gender || room.gender === 'male')
  }

  if (state.showGirlRooms) {
    return localStore.rooms.value.filter(room => !room.gender || room.gender === 'female')
  }
})

const showSetup = computed(() => ! state.selectedEvent || ! state.selectedGroup)

const showConfirm = computed(() => !! state.askToConfirm)
const showAlert = computed({
  get () {
    return !! state.alert
  },
  set () {
    state.alert = ''
  }
})
</script>

<template>
	<private-view :title="`Rooms (${state.selectedEvent ? state.selectedEvent.title : '' }: ${state.selectedGroup ? state.selectedGroup.name : ''})`" id="room-allocator">
    <template #actions:prepend>
      <Actions />
    </template>

    <template #navigation>
      <Navigation />
    </template>

    <template #sidebar>
      <Sidebar />
    </template>

    <div v-if="state.responseError" class="px-4">
      <v-error :error="state.responseError" />
    </div>

    <div class="flex-1 overflow-hidden p-4">
      <Draggable
          v-if="rooms"
          class="flex flex-wrap w-full h-full overflow-auto"
          v-model="rooms"
          group="rooms"
          handle=".room-handle"
          item-key="id">
        <template #item="{ element, index }">
          <DraggableRoom v-bind="element" :key="element.id" @edit="currentRoom = element"></DraggableRoom>
        </template>
      </Draggable>
    </div>

    <DatesSelector :room="currentRoom" @onClose="currentRoom = null" />

    <v-dialog v-model="showSetup" :persistent="true">
      <v-card>
        <v-card-title>Select Event and Group to manage rooms for</v-card-title>
        <v-sheet>
          <v-list>
            <v-list-item>
              <v-list-item-icon><v-icon name="event" /></v-list-item-icon>
              <v-list-item-content>
                <event-selector />
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-icon><v-icon name="groups" /></v-list-item-icon>
              <v-list-item-content>
                <group-selector />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirm" :persistent="true">
      <v-card>
        <v-card-title>{{ state.askToConfirm.question }}</v-card-title>
        <v-card-actions>
          <v-button @click="state.askToConfirm.no" class="mx-2" secondary>No</v-button>
          <v-button @click="state.askToConfirm.yes" class="mx-2">Yes</v-button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAlert">
      <v-notice type="danger">
        {{ state.alert }}
        <v-button @click="showAlert = false" icon secondary rounded class="ml-2"><v-icon name="close" /></v-button>
      </v-notice>
    </v-dialog>
  </private-view>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
  position: absolute;
  top: 0;
}

/*
#room-allocator #navigation .module-nav {
  display: none !important;
}
 */
</style>