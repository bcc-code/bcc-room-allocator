<script>
import { XIcon } from '@heroicons/vue/outline'
export default {
  props: {
    id: Number,
    name: String,
    age: Number,
    gender: String,
    allergy: String,
    room: [String, Number],
    activities: Array,
    canClear: Boolean,
  },
  components: { XIcon },
  inject: ['bcc_store'],
  computed: {
    state () {
      return this.bcc_store.state
    },
    index () {
      return `${this.name} ${this.id}`.toLowerCase()
    },
    highlight () {
      return this.state.search.length > 1 && this.index.indexOf(this.state.search.toLowerCase()) > -1
    },
    subtitle () {
      return this.activities.map(id => this.state.activities[id].name).join(', ')
    },
    selected () {
      return this.state.selected[this.id]
    }
  },
  methods: {
    remove() {
      this.bcc_store.setRoom(this.id, null)
    },
    toggleSelect () {
      if (this.state.selected[this.id]) {
        this.state.selected[this.id] = false
      } else {
        const selectGroup = `${this.room}-${this.gender}`
        if (this.state.selectGroup == selectGroup) {
          this.state.selected[this.id] = true
        } else {
          this.state.selectGroup = selectGroup
          this.state.selected = {
            [this.id]: true
          }
        }
      }
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-between px-4 py-2 rounded-md border"
       style="min-height: 4rem;"
       :class="highlight ? 'bg-indigo-100 text-indigo-500' : 'bg-white text-gray-800'">
    <button class="mr-2" @click="toggleSelect">
      <svg v-if="selected" class="rounded-full w-4 h-4 border" :class="gender == 'Male' ? 'border-blue-600 text-blue-400' : 'border-pink-600 text-pink-400'" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div v-else class="rounded-full w-4 h-4 shadow-inner border-2" :class="gender == 'Male' ? 'border-blue-600' : 'border-pink-600'"></div>
    </button>

    <div class="flex-1 xl:leading-tight">
      <p class="font-medium text-gray-800" :title="id">{{ name }}</p>
      <p class="text-gray-400 text-sm">{{ subtitle }}</p>
    </div>
    <div class="flex items-center">
      <p class="text-gray-400 text-sm">{{ age }}</p>
      <button v-if="canClear" @click="remove">
        <XIcon class="bg-gray-600 text-white rounded-full ml-2 w-4 h-4" />
      </button>
    </div>
  </div>
</template>