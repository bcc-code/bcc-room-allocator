<script setup>
import {ref, computed} from "vue";
import {useApi} from "@directus/extensions-sdk";

const roles = ref([])
const can_choose = ref([])
const role = ref('')
const error = ref(null)

const available_roles = computed(() => {
  return can_choose.value ? roles.value.filter(r => can_choose.value.includes(r.id)) : roles.value
})

const api = useApi()

function fetchRoles() {
  api.get('/users/me', {
    params: {
      fields: ['role', 'roles.role'],
    },
  }).then(({ data: { data } }) => {
    role.value = data.role;
    can_choose.value = data.roles?.map(r => r.role)
  });

  api.get('/roles', {
    params: {
      fields: ['id', 'name', 'icon', 'description']
    }
  }).then(({ data: { data } }) => roles.value = data)
}
fetchRoles()

async function selectRole(role) {
  try {
    await api.patch('/users/me', {
      role: role.id,
    })

    location.reload()
  } catch (err) {
    error.value = err
  }
}
</script>

<template>
  <private-view title="Choose role" id="role-chooser">
    <v-error v-if="error" :error="error" @click="error = null"/>
    <div class="flex flex-wrap">
      <v-info v-for="optRole in available_roles"
              :key="optRole.id"
              :icon="optRole.icon"
              :title="optRole.name"
              style="margin: 1rem;"
      >
        <p v-if="optRole.description">{{ optRole.description }}</p>
        <v-button :disabled="optRole.id === role" @click="selectRole(optRole)">
          Select
        </v-button>
      </v-info>
    </div>
  </private-view>
</template>