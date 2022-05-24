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
  const point = (eventStart.value || eventEnd.value) as string
  // Max arrival one day before the event
  const max = new Date(point)
  max.setDate(max.getDate() - 1)
  // Min arrival from one week before the event
  const min = new Date(point)
  min.setDate(min.getDate() - 7)

  return {
    min: formatDate(min),
    max: formatDate(max)
  }
})

const departureRange = computed(() => {
  const point = (eventEnd.value || eventStart.value) as string
  // Min departure one day after the event
  const min = new Date(point)
  min.setDate(min.getDate() + 1)
  // Max departure from one week after the event
  const max = new Date(point)
  max.setDate(max.getDate() + 7)

  return {
    min: formatDate(min),
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
        <div class="p-6">
          <v-info type="warning" icon="date_range" :title="`Request for shoulder days`">Please note that these dates have to be confirmed by Oslofjord and may be rejected.</v-info>

          <v-sheet>
            <v-divider class="mt-2">
              Arrival date
            </v-divider>
            <div class="mt-1 flex items-center">
              <v-input
                name="arrival" type="date"
                :disabled="loading"
                :min="arrivalRange.min"
                :max="arrivalRange.max"
                v-model="arrival"
              />
              <v-button icon @click="arrival = null" secondary><v-icon name="close"></v-icon></v-button>
            </div>
            <v-divider class="mt-2">
              Departure date
            </v-divider>
            <div class="mt-1 flex items-center">
              <v-input full-width
                name="departure" type="date"
                :disabled="loading"
                :min="departureRange.min"
                :max="departureRange.max"
                v-model="departure"
              />
              <v-button icon @click="departure = null" secondary><v-icon name="close"></v-icon></v-button>
            </div>
          </v-sheet>
        </div>
        <v-card-actions>
          <v-button @click="emit('onClose')" secondary>Cancel</v-button>
          <v-button :disabled="loading" @click="submit">Save</v-button>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>