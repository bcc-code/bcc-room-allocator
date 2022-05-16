<script setup lang="ts">
import {computed, inject, ref} from "vue";
import Registration from "./Registration.vue";
import Draggable from "vuedraggable";
import Store from "../store";

const localStore = inject('localStore') as Store
const { state } = localStore

const props = defineProps<{
  id: number,
  name: string,
  capacity: number,
  gender: string,
  arrival?: Date,
  departure?: Date,
  is_complete: boolean,
  is_reviewed: boolean,
}>()

const collapse = ref(false)
const loading = ref(false)

const guests = computed({
  get() {
    const _guests = localStore.registrations.value?.filter(reg => reg.room == props.id) ?? []

    _guests.sort((a, b) => a.name.localeCompare(b.name))
    if (state.sortBy === 'age') {
      _guests.sort((a, b) => b.age - a.age)
    }

    return _guests
  },
  set(value) {
    loading.value = true
    Promise.all(value.map(async reg => {
      if (canAdd(reg)) {
        await localStore.setRoom(reg.id, props.id)
      }
    })).then(() => loading.value = false)
  }
})

const count = computed(() => {
  return guests.value.length || 0
})

const currentGender = computed(() => props.gender || guests.value[0]?.gender || '')

const dateInfo = computed(() => {
      const a = props.arrival ? new Date(props.arrival) : null
      const d = props.departure ? new Date(props.departure) : null
      return `${a ? a.getDate() : ''} - ${d ? d.getDate() : ''}`
})

const isInsertableGroup = computed(() => {
      if (props.is_complete) return false
      return state.selectionId === `${props.id}-${currentGender.value}` ||
          (currentGender.value && state.selectionId.indexOf(`-${currentGender.value}`) < 0)
})

const statusClass = computed(() => {
  let bgFrom = ''
  let bgTo = ''
  let border = ''
  let text = 'text-gray-600'
  let pointer = ''

  if (currentGender.value === 'male') {
    text = 'text-white'
    bgFrom = props.is_complete ? 'from-indigo-600' : 'from-blue-500'
    bgTo = count.value < props.capacity ? 'to-blue-400' : 'to-blue-600'
    border = 'border-blue-400'
  } else if (currentGender.value === 'female') {
    text = 'text-white'
    bgFrom = props.is_complete ? 'from-purple-500' : 'from-pink-500'
    bgTo = count.value < props.capacity ? 'to-pink-400' : 'to-pink-600'
    border = 'border-pink-400'
  }

  if (count.value > props.capacity) {
    border = 'border-red-600'
  }

  if (localStore.selection.value.length) {
    pointer = isInsertableGroup.value ? 'cursor-not-allowed' : 'cursor-pointer'
  }

  return [bgFrom, bgTo, border, text, pointer]
})

function canAdd(reg) {
  if (props.is_complete) {
    return false
  }
  if (reg.room === props.id) {
    return false
  }
  return !currentGender.value || reg.gender === currentGender.value
}

function execute () {
  let selection = localStore.selection.value
  if (selection.length) {
    if (props.is_complete) { return localStore.alert('Cannot edit while room is marked as completed') }
    const roomId = isInsertableGroup.value ? null : props.id
    selection.forEach((id) => {
      localStore.setRoom(id, roomId)
    })
  }
}

function clear () {
  if (props.is_complete) { return localStore.alert('Cannot clear while room is marked as completed') }
  guests.value.forEach(reg => {
    localStore.setRoom(reg.id, null)
  })
}

async function toggleComplete () {
  if (! props.is_complete) {
    if (! guests.value.some(reg => reg.age > 18)) {
      return localStore.alert('Room can not be completed without an adult above 18 years old.')
    }
  }

  if (await localStore.confirm(`Are you sure you want to mark this room as ${props.is_complete ? 'uncompleted' : 'completed'}?`)) {
    localStore.toggleComplete(props.id)
  }
}
</script>

<template>
  <div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 shrink-0 grow m-2">
    <div class="rounded-lg shadow flex flex-col border-l-4" :class="statusClass">
      <button @click="execute"
              @dblclick.capture="collapse = !collapse"
              class="rounded-t-lg bg-white text-black flex justify-between items-center overflow-hidden"
              >
        <div class="flex items-center p-2 py-4 md:px-4">
          <button @click.prevent.capture="toggleComplete">
            <v-icon v-if="is_complete" name="check_circle" style="--v-icon-size: 1.4rem; --v-icon-color: var(--success)" />
            <v-icon v-else name="warning_amber" style="--v-icon-size: 1.4rem; --v-icon-color: var(--warning)" />
          </button>
          <p class="font-medium ml-1">{{ name }}</p>
          <v-progress-circular v-if="loading" indeterminate />
        </div>
        <div class="cursor-move flex items-center flex-shrink-0 relative room-handle block shadow rounded-l-full p-2 py-4 md:px-4">
          <span v-if="count <= capacity">{{ count }}/{{ capacity }}</span>
          <span v-else>{{ capacity }} <b class="text-red-500">+{{ count - capacity }}</b></span>
        </div>
      </button>
      <div class="overflow-y-auto transition-all shadow-inner block bg-white rounded-b-lg"
           :style="{
            maxHeight: collapse ? '1rem' : '100rem'
          }">
        <Draggable
            style="min-height: 2rem"
            class="block"
            v-model="guests"
            :disabled="is_complete"
            group="people"
            handle=".handle"
            item-key="id">
          <template #item="{ element, index }">
            <Registration v-bind="element" :key="element.id" :can-edit="! is_complete" />
          </template>
        </Draggable>
        <div class="flex items-center justify-between p-2">
          <button
              @click="$emit('edit')"
              class="flex items-center px-2 text-xs py-1 text-gray-800 bg-gray-100 rounded-full">
            <v-icon name="date_range" style="--v-icon-size: 1.2rem;" />
            <span v-if="dateInfo" class="ml-1">{{ dateInfo }}</span>
          </button>
          <button v-if="count > 1"
                  @click="clear"
                  :disabled="is_complete"
                  class="flex items-center px-2 text-xs py-1 rounded-full"
                  :class="is_complete ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-red-800 bg-red-100'"
          >
            Remove all
            <v-icon name="close" style="--v-icon-size: 1.4rem" class="rounded-full ml-2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>