<script>
import Registration from "./Registration.vue";
import Draggable from "vuedraggable";
import {XIcon} from "@heroicons/vue/outline";

export default {
  components: {
    Registration,
    Draggable,
    XIcon
  },
  props: {
    id: [String, Number],
    name: String,
    capacity: Number,
  },
  inject: ['bcc_store'],
  data: () => ({
    collapse: false
  }),
  computed: {
    state () {
      return this.bcc_store.state
    },
    registrations () {
      return this.state.registrations
    },
    guests: {
      get () {
        return this.registrations?.filter(reg => reg.room == this.id) ?? []
      },
      set (value) {
        value.filter(reg => reg.room !== this.id).forEach(reg => {
          if (this.canAdd(reg)) {
            this.collapse = false
            this.bcc_store.setRoom(reg.id, this.id)
          }
        })
      }
    },
    count () {
      return this.guests.length || 0
    },
    firstGuest () {
      return this.guests[0] ?? null
    },
    isBoysRoom () {
      return !! this.guests.find(reg => reg.gender == 'Male');
    },
    isGirlsRoom () {
      return !! this.guests.find(reg => reg.gender == 'Female');
    },
    isInsertableGroup () {
      return this.state.selectGroup == `${this.id}-${this.firstGuest?.gender}` ||
          (this.firstGuest?.gender && this.state.selectGroup.indexOf(this.firstGuest?.gender) < 0)
    },
    statusClass () {
      let bgFrom = 'from-gray-50'
      let bgTo = ''
      let border = ''
      let text = 'text-gray-600'
      let pointer = ''

      if (this.isBoysRoom) {
        bgTo = this.count < this.capacity ? 'to-blue-100' : 'to-blue-200'
        border = 'border-blue-400'
      }
      if (this.isGirlsRoom) {
        if (this.isBoysRoom) {
          bgFrom = 'from-blue-200'
        }
        bgTo = this.count < this.capacity ? 'to-pink-100' : 'to-pink-200'
        border = 'border-pink-400'
      }
      if (this.count > this.capacity) {
        border = 'border-red-600'
      }

      if (this.state.selection.length) {
        pointer = this.isInsertableGroup ? 'cursor-not-allowed' : 'cursor-pointer'
      }

      return [bgFrom, bgTo, border, text, pointer]
    }
  },
  methods: {
    canAdd(reg) {
      return ! this.firstGuest || reg.gender === this.firstGuest.gender
    },
    execute () {
      let selection = this.state.selection
      this.collapse = ! this.collapse
      if (selection.length) {
        this.collapse = false
        const roomId = this.isInsertableGroup ? null : this.id
        selection.forEach((id) => {
          this.bcc_store.setRoom(id, roomId)
        })
      }
    },
    clear () {
      this.guests.forEach(reg => {
        this.bcc_store.setRoom(reg.id, null)
      })
    }
  }
}
</script>

<template>
  <div class="bi-avoid-column py-1">
    <div class="rounded-lg shadow flex flex-col">
      <button @click="execute"
              class="bg-gradient-to-br  border-b-2 rounded-t-lg flex justify-between items-center text-sm overflow-hidden"
              :class="statusClass">
        <div class="flex items-center p-2 py-4 md:px-4">
          <svg v-if="collapse" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
          <svg v-else class="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <p class="font-medium ml-1">{{ name }}</p>
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
            group="people"
            handle=".handle"
            item-key="id">
          <template #item="{ element, index }">
            <Registration v-bind="element" can-clear />
          </template>
        </Draggable>
        <div class="p-2">
          <button v-if="count > 1"
                  @click="clear"
                  class="flex items-center ml-auto px-2 text-xs py-1 text-red-800 bg-red-100 rounded-full">
            Remove all
            <XIcon class="rounded-full ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

</template>