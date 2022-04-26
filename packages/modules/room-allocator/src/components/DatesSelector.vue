<script setup lang="ts">
import {computed, inject, ref, watch} from "vue";
import type Store from "../store";
import {Room} from "../types";

const store = inject('localStore') as Store;
const { state } = store;

const props = defineProps<{ room?: Room }>()

const emit = defineEmits(['onClose'])

const isOpen = computed(() => {
  return !! props.room
})

const arrival = ref<string | null>(null)
const departure = ref<string | null>(null)

function formatDate(date: any) {
  if (! date) {
    return null
  }
  let d = new Date(date)
  return !isNaN(d as any) ? d.toISOString().split('T')[0] : null
}

watch([props], () => {
  arrival.value = formatDate(props.room?.arrival)
  departure.value = formatDate(props.room?.departure)
})

const eventStart = computed(() => {
  return formatDate(state.selectedEvent?.start_date)
})

const eventEnd = computed(() => {
  return formatDate(state.selectedEvent?.end_date)
})

const arrivalRange = computed(() => {
  // Min arrival from one week before the event
  let min: null | string | Date = eventStart.value || eventEnd.value
  if (min) {
    min = new Date(min)
    min.setDate(min.getDate() - 7)
  }

  // Use the earliest date
  const max = [formatDate(departure.value), eventStart.value].filter(d => d)
  max.sort((a,b) => a > b ? 1 : -1)

  return {
    min: formatDate(min),
    max: max[0]
  }
})

const departureRange = computed(() => {
  // Max departure one week after the event
  let max, point = eventEnd.value || eventStart.value
  if (point) {
    max = new Date(point)
    max.setDate(max.getDate() + 7)
  }

  console.log(point)
  // Use the latest date
  const min = [formatDate(arrival.value), point].filter(d => d)
  min.sort((a,b) => a > b ? -1 : 1)
  console.log(min)
  return {
    min: min[0],
    max: formatDate(max)
  }
})

const loading = ref(false)
async function submit() {
  if (props.room) {
    loading.value = true
    await store.updateRoom(props.room, {
      arrival: formatDate(arrival.value),
      departure: formatDate(departure.value)
    })
    loading.value = false
    emit('onClose')
  }
}
</script>

<template>
  <v-dialog v-model="isOpen" :persistent="true">
    <v-card v-if="room">
      <form @submit.prevent="submit">
        <v-card-title>{{ room.name }} #{{ room.id }}</v-card-title>
        <v-sheet>
          <v-divider class="mt-2">
            Arrival date
          </v-divider>
          <div class="mt-1">
            <v-input
              name="arrival" type="date"
              :disabled="loading"
              :min="arrivalRange.min"
              :max="arrivalRange.max"
              v-model="arrival"
            />
          </div>
          <v-divider class="mt-2">
            Departure date
          </v-divider>
          <div class="mt-1">
            <v-input full-width
              name="departure" type="date"
              :disabled="loading"
              :min="departureRange.min"
              :max="departureRange.max"
              v-model="departure"
            />
          </div>
        </v-sheet>
        <v-card-actions>
          <v-button @click="emit('onClose')" secondary>Cancel</v-button>
          <v-button :disabled="loading" @click="submit">Submit</v-button>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>