<script setup lang="ts">
import {computed, inject} from "vue";
import Store from "../store";

const localStore = inject('localStore') as Store
const { state } = localStore
</script>

<template>
  <v-input
      v-model="state.search" trim
      style="--input-height: 50px; --border-radius: 100px"
      placeholder="Search person"
  >
    <template #prepend>
      <v-icon name="search" />
    </template>
  </v-input>
</template>