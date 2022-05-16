<script setup lang="ts">
import {computed, inject, watch} from "vue";
import Store from "../store";

const localStore = inject('localStore') as Store
const { state } = localStore

const groups = computed(() => localStore.groups.value)

watch([groups], () => {
  if (groups.value.length > 10) {
    localStore.setSelectedGroup(69)
  } else {
    localStore.setSelectedGroup(groups.value[0])
  }
})
</script>

<template>
  <v-select
      v-if="groups.length > 0"
      :model-value="state.selectedGroup ? state.selectedGroup.id : null"
      :items="groups"
      name="group"
      placeholder="Select a Group"
      item-text="name"
      item-value="id"
      @update:model-value="localStore.setSelectedGroup($event)"
  />
</template>