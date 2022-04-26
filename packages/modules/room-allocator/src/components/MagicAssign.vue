<script setup lang="ts">
import {inject, ref} from "vue";
import Store from "../store";
import AutoAssign from "../room-algorithm";
import {Registration} from "../types";

const localStore = inject('localStore') as Store
const { state } = localStore

const busy = ref('')
const status = ref('')
const percentage = ref(-1)
const allowOverbooking = ref(false)

async function magicAssign(gender: 'male' | 'female') {
  if (busy.value) {
    return
  }
  busy.value = gender
  ++state.loading

  try {
    status.value = 'Starting up the magic...'
    let progress = 0
    percentage.value = 0
    const step = () => percentage.value = Math.round((++progress / solution.totalGuests) * 100)

    const registrations: Array<Registration> = localStore.registrations.value.filter(r => ! r.room && r.gender === gender)
    const Assigner = new AutoAssign(localStore, registrations, allowOverbooking.value)
    const solution = await Assigner.run((msg) => {
      status.value = msg
    })
    status.value = 'Assigning guests to their rooms...'
    const Q = []
    solution.roomsMap.forEach((room, roomId) => {
      room.guests.forEach(reg => {
        if (reg.room !== roomId) {
          Q.push(localStore.setRoom(reg.id, roomId).then(step))
        } else {
          step()
        }
      })
    })
    await Promise.all(Q)

    status.value = 'Done!'
  } catch (err) {
    console.error(err)
    localStore.alert(err.message)
  }

  --state.loading
  busy.value = ''
  setTimeout(() => {
    status.value = ''
    percentage.value = -1
  }, 3000)
}

</script>

<template>
  <v-checkbox full-width block v-model="allowOverbooking" label="Allow Overbooking" />
  <br/>
  <v-button
    :loading="busy === 'male'"
    :disabled="!! busy"
    full-width
    @click="magicAssign('male')"
    style="--v-button-color: var(--blue-125); --v-button-background-color: var(--blue-25)"
  >
    <icon name="male" class="mr-4"/> Auto assign Boys
  </v-button>
  <br/>
  <v-button
    :loading="busy === 'female'"
    :disabled="!! busy"
    full-width
    @click="magicAssign('female')"
    style="--v-button-color: var(--pink-125); --v-button-background-color: var(--pink-25)"
  >
    <icon name="female" class="mr-4"/> Auto assign Girls
  </v-button>
  <br>
  <v-notice v-if="status">{{ status }}</v-notice>
  <v-progress-linear v-if="percentage > -1" :value="percentage" rounded />
</template>