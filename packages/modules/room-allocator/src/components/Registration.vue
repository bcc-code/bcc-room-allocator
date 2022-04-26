<script setup lang="ts">
import {computed, inject} from "vue";
import type Store from "../store";

const props = defineProps<{
  id: string,
  name: string,
  age: number,
  gender: string,
  allergy: string,
  room: [string, number],
  activities: Array<{
    activity: number
  }>,
  canEdit: Boolean,
}>();

const localStore = inject('localStore') as Store;
const { state } = localStore;

const index = computed(() => {
  return `${props.name} ${props.id}`.toLowerCase()
});
const highlight = computed(() => {
  return state.search?.length > 1 && index.value.indexOf(state.search.toLowerCase()) > -1
});
const subtitle = computed(() => {
  return props.activities.map(({activity}) => localStore.activites.value.find(a => a.id === activity)?.name).join(', ')
});
const selected = computed(() => {
  return state.selected[props.id]
});


function remove() {
  if (props.canEdit) {
    localStore.setRoom(props.id, null)
  }
}

function toggleSelect () {
  if (state.selected[props.id]) {
    state.selected[props.id] = false
  } else if (props.canEdit) {
    const selectionId = `${props.room}-${props.gender}`
    if (state.selectionId === selectionId) {
      state.selected[props.id] = true
    } else {
      state.selectionId = selectionId
      state.selected = {
        [props.id]: true
      }
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-between p-2 md:px-4 py-2 rounded-md border cursor-pointer"
       style="min-height: 4rem;"
       :class="highlight ? 'bg-indigo-100 text-indigo-500' : 'bg-white text-gray-800'">
    <button v-if="canEdit" class="mr-2" @click.prevent="toggleSelect">
      <svg v-if="selected" class="rounded-full w-5 h-5 md:w-4 md:h-4 border" :class="gender === 'male' ? 'border-blue-600 text-blue-400' : 'border-pink-600 text-pink-400'" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div v-else class="rounded-full w-5 h-5 md:w-4 md:h-4 shadow-inner border-2" :class="gender === 'male' ? 'border-blue-600' : 'border-pink-600'"></div>
    </button>

    <div class="flex-1 leading-tight handle text-sm">
      <p class="font-medium text-gray-800" :title="id">{{ name }}</p>
      <p class="w-full text-gray-500 overflow-ellipsis">{{ subtitle }}</p>
    </div>
    <div class="flex items-center">
      <p class="text-gray-400 text-sm">{{ age }}</p>
      <button v-if="canEdit && room" @click="remove">
        <v-icon name="close" style="--v-icon-size: 1.4rem" class="rounded-full ml-2"/>
      </button>
    </div>
  </div>
</template>