<template>
  <Layout>
    <Draggable
        v-if="rooms"
        grid-class="w-full grid grid-flow-col grid-cols-1 auto-rows-max gap-6 lg:grid-cols-2"
        class="w-full col-count-1 lg:col-count-2"
        v-model="rooms"
        group="rooms"
        handle=".room-handle"
        item-key="id">
      <template #item="{ element, index }">
        <Room v-bind="element" :key="element.id"></Room>
      </template>
    </Draggable>
  </Layout>
</template>

<script>
import Store from './store.js'
import Layout from "./layout.vue";
import Room from "./components/Room.vue";
import Draggable from "vuedraggable";

export default {
  components: {
    Layout,
    Draggable,
    Room
  },
  data() {
    const userStore = this.stores?.useUserStore()
    const user = userStore?.currentUser
    const bcc_store = new Store(user, this.api)
    this.$nextTick(() => {
      bcc_store.loadGroups()
      bcc_store.loadActivities()
    })

    return {
      user,
      bcc_store,
    };
  },
  inject: ['stores', 'api'],
  provide() {
    return {
      bcc_store: this.bcc_store
    }
  },
  computed: {
    rooms: {
      get() { return this.bcc_store.state.rooms },
      set(value) { this.bcc_store.state.rooms = value}
    }
  }
};
</script>