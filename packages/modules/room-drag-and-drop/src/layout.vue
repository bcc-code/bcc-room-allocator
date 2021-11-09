
<script>
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { SearchIcon, SparklesIcon } from '@heroicons/vue/solid'
import { MenuAlt1Icon, XIcon } from '@heroicons/vue/outline'
import Draggable from "vuedraggable";
import Registration from "./components/Registration.vue";

export default {
  components: {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
    MenuAlt1Icon,
    SearchIcon,
    XIcon,
    SparklesIcon,
    Draggable,
    Registration,
  },
  data () {
    return {
      overbook: false,
    }
  },
  computed: {
    state () {
      return this.bcc_store.state
    },
    activities () {
      return this.state.activities
    },
    registrations () {
      let filters = this.state.filteredActivities
      if (filters.length) {
        return this.state.registrations.filter(reg => filters.find((value) => reg.activities.indexOf(value) > -1))
      }
      return this.state.registrations
    },
    boys () {
      return this.registrations?.filter(reg => reg.gender == 'Male' && !reg.room)
    },
    girls () {
      return this.registrations?.filter(reg => reg.gender == 'Female' && !reg.room)
    },
    groups () {
      return this.state.groups || {}
    },
    group: {
      get () { return this.state.group },
      set (value) { this.bcc_store.setGroup(value) }
    }
  },
  inject: ['bcc_store'],
}
</script>

<template>
  <div class="relative min-h-screen flex flex-col bg-gray-100">
    <!-- Navbar -->
    <Disclosure as="nav" class="flex-shrink-0 bg-bcc-green" v-slot="{ open }">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <!-- Logo section -->
          <a href="/admin/content/registrations" class="flex items-center px-2 lg:px-0 xl:w-64">
            <div class="flex-shrink-0">
              <svg class="h-8 w-auto" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="500" cy="500" r="500" fill="white"/>
                <path d="M425 206C425 172.863 451.863 146 485 146H515C548.137 146 575 172.863 575 206V236C575 269.137 548.137 296 515 296H485C451.863 296 425 269.137 425 236V206Z" fill="#004E48"/>
                <path d="M595 376C595 342.863 621.863 316 655 316H685C718.137 316 745 342.863 745 376V406C745 439.137 718.137 466 685 466H655C621.863 466 595 439.137 595 406V376Z" fill="#004E48"/>
                <path d="M425 776C425 742.863 451.863 716 485 716H515C548.137 716 575 742.863 575 776V806C575 839.137 548.137 866 515 866H485C451.863 866 425 839.137 425 806V776Z" fill="#004E48"/>
                <path d="M425 376C425 342.863 451.863 316 485 316H515C548.137 316 575 342.863 575 376V636C575 669.137 548.137 696 515 696H485C451.863 696 425 669.137 425 636V376Z" fill="#004E48"/>
                <path d="M255 376C255 342.863 281.863 316 315 316H515C548.137 316 575 342.863 575 376V406C575 439.137 548.137 466 515 466H315C281.863 466 255 439.137 255 406V376Z" fill="#004E48"/>
              </svg>
            </div>
          </a>

          <!-- Search section -->
          <div class="flex-1 flex items-center justify-center lg:justify-end">
            <div v-if="state.group && state.group.id" class="w-full px-2 lg:px-6">
              <label for="search" class="sr-only">Search by name or id</label>
              <div class="relative text-gray-200 focus-within:text-gray-400">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon class="h-5 w-5" aria-hidden="true" />
                </div>
                <input id="search" name="search" v-model="state.search" class="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-400 bg-opacity-25 text-gray-100 placeholder-gray-200 focus:outline-none focus:bg-white focus:ring-0 focus:placeholder-gray-400 focus:text-gray-900 sm:text-sm" placeholder="Search" type="search" />
              </div>
            </div>
            <Menu as="div" class="ml-3 relative">
              <MenuButton class="max-w-xs py-1 px-2 text-gray-100 flex items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-100">
                <svg v-if="state.filteredActivities.length" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <p class="ml-2 text-sm">Filter</p>
              </MenuButton>
              <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                <MenuItems class="origin-top-right absolute z-10 mt-2 w-48 max-h-64 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-for="item in activities" :key="item.id">
                    <label :for="'act'+item.id" class="block bg-gray-100 rounded-md w-full py-2 px-4 text-sm flex items-center">
                      <input :id="'act'+item.id" v-model="state.filteredActivities" :value="item.id" type="checkbox"
                             class="focus:ring-gray-500 h-4 w-4 mr-2 text-gray-600 border-gray-300 rounded" />
                      <p>{{ item.name }}</p>
                    </label>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
          <div class="flex lg:hidden">
            <!-- Mobile menu button -->
            <DisclosureButton class="bg-bcc-green inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-bcc-green focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-gray-600 focus:ring-white">
              <span class="sr-only">Open main menu</span>
              <MenuAlt1Icon v-if="!open" class="block h-6 w-6" aria-hidden="true" />
              <XIcon v-else class="block h-6 w-6" aria-hidden="true" />
            </DisclosureButton>
          </div>
          <!-- Links section -->
          <div class="hidden lg:block lg:w-80">
            <div class="flex items-center justify-end">
              <!-- Group Selector -->
              <Menu as="div" class="ml-3 relative">
                <MenuButton class="max-w-xs py-1 px-2 text-gray-100 flex items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-100">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="ml-2">{{ group.name }}</p>
                </MenuButton>
                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                  <MenuItems class="origin-top-right absolute z-10 right-0 mt-2 w-48 max-h-64 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem v-for="item in groups" :key="item.id">
                      <button @click="bcc_store.setGroup(item)" :disabled="item.id == state.group.id"
                              :class="item.id == state.group.id ? 'text-gray-900 bg-gray-300 font-medium' : 'text-gray-700'"
                              class="block bg-gray-100 rounded-md w-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-500">{{ item.name }}</button>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      <DisclosurePanel class="lg:hidden">
        <div class="px-2 pt-2 pb-3 flex flex-col items-center">
          <template v-for="item in groups" :key="item.id">
            <button @click="bcc_store.setGroup(item)" :disabled="item.id == state.group.id"
                    :class="item.id == state.group.id ? 'text-gray-600 bg-gray-100 font-medium' : 'bg-white text-gray-700'"
                    class="block py-2 px-4 my-1 text-sm focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-500">{{ item.name }}</button>
          </template>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <v-progress-linear :indeterminate="state.loading > 0" />

    <!-- 3 column wrapper -->
    <div class="flex-grow flex flex-col md:flex-row w-full max-w-7xl mx-auto xl:px-8 bg-gray-100">
      <!-- Start left column area -->
      <div class="order-3 md:order-1 w-full md:w-1/3 lg:w-1/4 md:sticky top-0">
        <div class="h-full relative">
          <div class="sticky max-h-screen inset-0 p-6 overflow-hidden overflow-y-auto rounded-lg">
            <button @click="bcc_store.magicAssign(boys, overbook)" type="button"
                    class="flex items-center ml-auto mb-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Auto assign
              <SparklesIcon class="ml-2 -mr-1 h-5 w-5"/>
            </button>
            <Draggable
                class="boys-list"
                :list="boys"
                group="people"
                itemKey="id"
                handle=".handle"
            >
              <template #item="{ element, index }">
                <Registration v-bind="element" :key="element.id" />
              </template>
            </Draggable>
          </div>
        </div>
      </div>
      <!-- End left column area -->

      <!-- Start main area-->
      <div class="order-2 bg-white border-l border-r lg:min-w-0 flex-1">
        <div class="h-full py-6 px-4 sm:px-6 lg:px-8">
          <div class="pb-2 border-b border-gray-100">
            <label for="allow overbook" class="block bg-gray-100 rounded-md w-full py-2 px-4 text-sm flex items-center">
              <input id="allow overbook" v-model="overbook" type="checkbox" class="focus:ring-gray-500 h-4 w-4 mr-2 text-gray-600 border-gray-300 rounded" />
              <p>Allow overbooking</p>
            </label>
          </div>
          <slot></slot>
        </div>
      </div>
      <!-- End main area -->

      <!-- Start right column area -->
      <div class="order-4 w-full md:w-1/3 lg:w-1/4 md:sticky top-0">
        <div class="h-full relative">
          <div class="sticky max-h-screen inset-0 p-6 overflow-hidden overflow-y-auto rounded-lg">
            <button @click="bcc_store.magicAssign(girls, overbook)" type="button"
                    class="flex items-center mr-auto mb-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
              <SparklesIcon class="mr-2 -ml-1 h-5 w-5"/>
              Auto assign
            </button>
            <Draggable
                class="girls-list"
                :list="girls"
                group="people"
                itemKey="id"
                handle=".handle"
            >
              <template #item="{ element, index }">
                <Registration v-bind="element" :key="element.id" />
              </template>
            </Draggable>
          </div>
        </div>
      </div>
      <!-- End right column area -->
    </div>
  </div>
</template>