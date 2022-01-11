<script setup>
import {computed, inject, ref, watch} from "vue";
import {Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot} from "@headlessui/vue";

const props = defineProps({
  room: Object
})

const BccStore = inject("bcc_store");

const emit = defineEmits(['onClose'])

const isOpen = computed(() => {
  return !! props.room
})

const arrival = ref(null)
const departure = ref(null)

function formatDate(date) {
  if (! date) {
    return null
  }
  let d = new Date(date)
  return !isNaN(d) ? d.toISOString().split("T")[0] : null
}

watch([props], () => {
  arrival.value = formatDate(props.room?.arrival)
  departure.value = formatDate(props.room?.departure)
})

const eventStart = computed(() => {
  return formatDate(BccStore.state.event.start_date)
})

const eventEnd = computed(() => {
  return formatDate(BccStore.state.event.end_date)
})

const arrivalRange = computed(() => {
  // Min arrival from one week before the event
  let min = eventStart.value || eventEnd.value
  if (min) {
    min = new Date(min)
    min.setDate(min.getDate() - 7)
  }

  // Use the earliest date
  const max = [formatDate(departure.value), eventStart.value].filter(d => d)
  console.log(max)
  max.sort((a,b) => a > b ? 1 : -1)
  console.log(max)

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
  loading.value = true
  await BccStore.updateRoom(props.room, {
    arrival: formatDate(arrival.value),
    departure: formatDate(departure.value)
  })
  loading.value = false
  emit('onClose')
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('onClose')">
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="min-h-screen px-4 flex items-center justify-center">
          <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100"
              leave-to="opacity-0"
          >
            <DialogOverlay class="fixed inset-0 bg-opacity-25 bg-black" />
          </TransitionChild>

          <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
          >
            <div v-if="props.room"
                class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
            >
              <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900"
              >
                {{ props.room.name }} #{{ props.room.id}}
              </DialogTitle>
              <form @submit.prevent="submit" class="mt-2">
                <div>
                  <label for="arrival" class="block text-sm font-medium text-gray-700">
                    Arrival date
                  </label>
                  <div class="mt-1">
                    <input id="arrival" name="arrival" type="date"
                           :disabled="loading"
                           :min="arrivalRange.min"
                           :max="arrivalRange.max"
                           v-model="arrival"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
                <div>
                  <label for="departure" class="block text-sm font-medium text-gray-700">
                    Departure date
                  </label>
                  <div class="mt-1">
                    <input id="departure" name="departure" type="date"
                           :disabled="loading"
                           :min="departureRange.min"
                           :max="departureRange.max"
                           v-model="departure"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                  </div>
                </div>
                <input
                    type="submit"
                    placeholder="Submit"
                    :disabled="loading"
                    class="mt-4 block mx-auto px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                />
              </form>
            </div>
            <div v-else>…</div>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>