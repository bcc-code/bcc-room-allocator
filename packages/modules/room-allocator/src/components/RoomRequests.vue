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

const requests = ref<Array<string>>([])

const loading = ref(false)
async function submit() {
  if (props.room) {
    loading.value = true
    await store.updateRoom(props.room, {
      requests: requests.value
    })
    loading.value = false
    emit('onClose')
  }
}

watch([props], () => {
  requests.value = props.room?.requests ?? []
}, { immediate: true })
</script>

<template>
  <v-dialog v-model="isOpen" :persistent="true">
    <v-card v-if="room">
      <form @submit.prevent="submit">
        <div class="p-6">
          <v-info type="warning" icon="room_preferences" title="Special room requests">Please note that these preferences need to be confirmed by Oslofjord and may be rejected.</v-info>

          <v-sheet>
            <v-checkbox v-model="requests" :disabled="room.features.includes('handicapped')" value="handicapped" label="Handicap" />
            <v-checkbox v-model="requests" :disabled="room.features.includes('long_bed')" value="long_bed" label="Extra long bed" />
          </v-sheet>
        </div>
        <v-card-actions>
          <v-button @click="emit('onClose')" secondary>Cancel</v-button>
          <v-button :disabled="loading" @click="submit">Submit</v-button>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>
</template>