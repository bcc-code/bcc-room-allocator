<script>
import Registration from "./Registration.vue";
import Draggable from "vuedraggable";
import {XIcon, CheckCircleIcon, ExclamationCircleIcon, CalendarIcon} from "@heroicons/vue/outline";

export default {
  components: {
    Registration,
    Draggable,
    XIcon, CheckCircleIcon, ExclamationCircleIcon, CalendarIcon
  },
  props: {
    id: [String, Number],
    name: String,
    capacity: Number,
    gender: String,
    arrival: Date,
    departure: Date,
    is_complete: Boolean,
    is_reviewed: Boolean,
  },
  inject: ['bcc_store'],
  data() {
    return {
      collapse: false
    }
  },
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
            this.bcc_store.setRoom(reg.id, this.id)
          }
        })
      }
    },
    count () {
      return this.guests.length || 0
    },
    currentGender () {
      return this.gender || this.guests[0]?.gender || null
    },
    dateInfo () {
      const a = this.arrival ? new Date(this.arrival) : null
      const d = this.departure ? new Date(this.departure) : null
      return `${a ? a.getDate() : ''} - ${d ? d.getDate() : ''}`
    },
    isInsertableGroup () {
      if (this.is_complete) return false
      return this.state.selectGroup === `${this.id}-${this.currentGender}` ||
          (this.currentGender && this.state.selectGroup.indexOf(this.currentGender) < 0)
    },
    statusClass () {
      let bgFrom = ''
      let bgTo = ''
      let border = ''
      let text = 'text-gray-600'
      let pointer = ''

      if (this.currentGender === 'male') {
        text = 'text-white'
        bgFrom = this.is_complete ? 'from-indigo-600' : 'from-blue-500'
        bgTo = this.count < this.capacity ? 'to-blue-400' : 'to-blue-600'
        border = 'border-blue-400'
      } else if (this.currentGender === 'female') {
        text = 'text-white'
        bgFrom = this.is_complete ? 'from-purple-500' : 'from-pink-500'
        bgTo = this.count < this.capacity ? 'to-pink-400' : 'to-pink-600'
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
      if (this.is_complete) return false
      return !this.currentGender || reg.gender === this.currentGender
    },
    execute () {
      let selection = this.state.selection
      if (selection.length) {
        if (this.is_complete) { return alert('Cannot edit while room is marked as completed') }
        const roomId = this.isInsertableGroup ? null : this.id
        selection.forEach((id) => {
          this.bcc_store.setRoom(id, roomId)
        })
      }
    },
    clear () {
      if (this.is_complete) { return alert('Cannot clear while room is marked as completed') }
      this.guests.forEach(reg => {
        this.bcc_store.setRoom(reg.id, null)
      })
    },
    toggleComplete () {
      if (! this.is_complete) {
        if (! this.guests.some(reg => reg.age > 18)) {
          return alert('Room can not be completed without an adult above 18 years old.')
        }

        if (! confirm('Are you sure you want to mark this room as completed?')) {
          return
        }
      } else if (! confirm('Are you sure you want to mark this room as incomplete?')) {
        return
      }

      this.bcc_store.toggleComplete(this.id)
    }
  }
}
</script>

<template>
  <div class="bi-avoid-column py-1">
    <div class="rounded-lg shadow flex flex-col border-l-4" :class="statusClass">
      <button @click="execute"
              @dblclick.capture="collapse = !collapse"
              class="rounded-t-lg bg-white text-black flex justify-between items-center overflow-hidden"
              >
        <div class="flex items-center p-2 py-4 md:px-4">
          <button @click.prevent.capture="toggleComplete">
            <CheckCircleIcon v-if="is_complete" class="h-5 w-5" />
            <ExclamationCircleIcon v-else class="h-5 w-5" />
          </button>
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
            <Registration v-bind="element" :key="element.id" :can-edit="! is_complete" />
          </template>
        </Draggable>
        <div class="flex items-center justify-between p-2">
          <button
              @click="$emit('edit')"
              class="flex items-center px-2 text-xs py-1 text-gray-800 bg-gray-100 rounded-full">
            <CalendarIcon class="w-4"/>
            <span v-if="dateInfo" class="ml-1">{{ dateInfo }}</span>
          </button>
          <button v-if="count > 1"
                  @click="clear"
                  class="flex items-center px-2 text-xs py-1 text-red-800 bg-red-100 rounded-full">
            Remove all
            <XIcon class="rounded-full ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>