<script setup lang="ts">
import {inject} from "vue";
import Store from "../store";
import EventSelector from "../components/EventSelector.vue";
import GroupSelector from "../components/GroupSelector.vue";
import MagicAssign from "../components/MagicAssign.vue";

const localStore = inject('localStore') as Store
const { state } = localStore
</script>

<template>

  <sidebar-detail
      :close="true"
      icon="settings"
      title="Display">
    <v-checkbox v-model="state.showBoyRooms"
                style="--v-checkbox-color: var(--blue)"
                label="Show boy rooms"
                block full-width
    />
    <br/>
    <v-checkbox v-model="state.showGirlRooms"
                style="--v-checkbox-color: var(--pink-110)"
                label="Show girl rooms"
                block full-width
    />
  </sidebar-detail>

  <sidebar-detail
      icon="event"
      :title="state.selectedEvent ? state.selectedEvent.title : 'Select event'">
    <event-selector />
  </sidebar-detail>

  <sidebar-detail
      icon="groups"
      :title="state.selectedGroup ? state.selectedGroup.name : 'Select group'">
    <group-selector />
  </sidebar-detail>

  <sidebar-detail
      icon="auto_fix_normal"
      title="Magic Assign">
    <MagicAssign />
  </sidebar-detail>

</template>