<template>
  <transition-group name="slide-fade" mode="in-out">
    <template v-if="! events || ! groups">
      <v-progress-linear :indeterminate="true" />
    </template>
    <div v-else-if="! event" class="w-full h-full flex flex-col items-center justify-center p-12">
      <h2 class="text-prime-lighter font-semibold text-2xl">Select Event</h2>

      <div class="text-left overflow-y-auto" style="max-height: 50vh">
        <template v-for="e in events">
          <label class="flex items-center p-1">
            <input type="radio" v-model="event" name="event" :value="e" />
            <span class="ml-2">{{ e.title }}</span>
          </label>
        </template>
      </div>
    </div>
    <div v-else-if="! group" class="w-full h-full flex flex-col items-center justify-center p-12">
      <h2 class="text-prime-lighter font-semibold text-2xl">Select Group</h2>

      <div class="text-left overflow-y-auto" style="max-height: 50vh">
        <template v-for="g in groups">
          <label class="flex items-center p-1">
            <input type="radio" v-model="group" name="event" :value="g" />
            <span class="ml-2">{{ g.name }}</span>
          </label>
        </template>
      </div>
    </div>
    <Layout v-else>
      <Draggable
          v-if="rooms"
          grid-class="w-full grid grid-flow-col grid-cols-1 auto-rows-max gap-6 lg:grid-cols-2"
          class="w-full col-count-1 lg:col-count-2"
          v-model="rooms"
          group="rooms"
          handle=".room-handle"
          item-key="id">
        <template #item="{ element, index }">
          <Room v-bind="element" :key="element.id" @edit="currentRoom = element"></Room>
        </template>
      </Draggable>
    </Layout>
  </transition-group>

  <DatesSelector :room="currentRoom" @onClose="currentRoom = null" />
</template>

<script>
import Store from './store.js'
import Layout from "./layout.vue";
import Room from "./components/Room.vue";
import Draggable from "vuedraggable";
import DatesSelector from "./components/DatesSelector.vue";

export default {
  components: {
    DatesSelector,
    Layout,
    Draggable,
    Room
  },
  data() {
    const userStore = this.stores?.useUserStore()
    const user = userStore?.currentUser
    const bcc_store = new Store(user, this.api)
    this.$nextTick(() => {
      bcc_store.loadEvents()
      bcc_store.loadGroups()
      bcc_store.loadActivities()
    })

    return {
      user,
      bcc_store,
      currentRoom: null
    };
  },
  inject: ['stores', 'api'],
  provide() {
    return {
      bcc_store: this.bcc_store
    }
  },
  computed: {
    events() {
      return this.bcc_store.state.events
    },
    event: {
      get() { return this.bcc_store.state.event },
      set(value) {
        this.bcc_store.state.event = value
        if (this.groups && this.groups.length === 1) {
          this.group = this.groups[0]
        }
      }
    },
    groups() {
      return this.bcc_store.state.groups
    },
    group: {
      get() { return this.bcc_store.state.group },
      set(value) { this.bcc_store.setGroup(value) }
    },
    rooms: {
      get() {
        return this.bcc_store.state.rooms
      },
      set(value) { this.bcc_store.state.rooms = value}
    }
  }
};
</script>