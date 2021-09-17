
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
  <div class="relative min-h-screen flex flex-col bg-gray-50">
    <!-- Navbar -->
    <Disclosure as="nav" class="flex-shrink-0 bg-indigo-600" v-slot="{ open }">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div class="relative flex items-center justify-between h-16">
          <!-- Logo section -->
          <a href="/admin/collections" class="flex items-center px-2 lg:px-0 xl:w-64">
            <div class="flex-shrink-0">
              <svg class="h-8 w-auto"  viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M73.6806 29.0325C73.4581 30.1308 73.1839 31.2115 72.8145 32.2583H77.4194C81.8661 32.2583 85.4839 35.876 85.4839 40.3227V54.9211C93.6226 55.734 100 62.6195 100 70.9678C100 79.8613 92.7645 87.0968 83.871 87.0968C74.9774 87.0968 67.7419 79.8613 67.7419 70.9678C67.7419 62.6195 74.1194 55.7324 82.2581 54.9211V40.3227C82.2581 37.655 80.0871 35.4841 77.4194 35.4841H71.3758C70.0419 37.9986 68.2516 40.2695 66.0629 42.2131C67.971 42.8615 69.3548 44.6502 69.3548 46.7743C69.3548 49.4421 67.1839 51.613 64.5161 51.613H62.7742C61.9871 57.0743 57.2887 61.2904 51.6129 61.2904V67.8243C59.7516 68.6372 66.129 75.5226 66.129 83.871C66.129 92.7645 58.8935 100 50 100C41.1065 100 33.871 92.7645 33.871 83.871C33.871 75.5226 40.2484 68.6356 48.3871 67.8243V61.2904C42.7113 61.2904 38.0129 57.0743 37.2258 51.613H35.4839C32.8161 51.613 30.6452 49.4421 30.6452 46.7743C30.6452 44.6647 32.0097 42.8856 33.8968 42.2244C31.7113 40.2792 29.9403 37.9905 28.6113 35.4841H22.5806C19.9129 35.4841 17.7419 37.655 17.7419 40.3227V54.9211C25.8806 55.734 32.2581 62.6195 32.2581 70.9678C32.2581 79.8613 25.0226 87.0968 16.129 87.0968C7.23548 87.0968 0 79.8613 0 70.9678C0 62.6195 6.37742 55.7324 14.5161 54.9211V40.3227C14.5161 35.876 18.1339 32.2583 22.5806 32.2583H27.1903C26.8194 31.2083 26.5161 30.1308 26.2935 29.0325H11.2903C6.84355 29.0325 3.22581 25.4147 3.22581 20.968V15.8325C1.35323 15.1648 0 13.3906 0 11.2906C0 8.62284 2.17097 6.45187 4.83871 6.45187C7.50645 6.45187 9.67742 8.62284 9.67742 11.2906C9.67742 13.3906 8.32419 15.1648 6.45161 15.8325V20.968C6.45161 23.6357 8.62258 25.8067 11.2903 25.8067H25.8661C25.7952 24.7421 25.7968 23.6647 25.8661 22.5809H20.9677C16.521 22.5809 12.9032 18.9631 12.9032 14.5164V9.3809C11.0306 8.71316 9.67742 6.93897 9.67742 4.83898C9.67742 2.17124 11.8484 0.000279784 14.5161 0.000279784C17.1839 0.000279784 19.3548 2.17124 19.3548 4.83898C19.3548 6.93897 18.0016 8.71316 16.129 9.3809V14.5164C16.129 17.1841 18.3 19.3551 20.9677 19.3551H26.2887C28.3355 9.2438 36.8597 1.30673 47.2339 0.155118C54.221 -0.61746 60.9339 1.51318 66.129 6.15994C70.0323 9.65348 72.6565 14.3019 73.6903 19.3551H79.0323C81.7 19.3551 83.871 17.1841 83.871 14.5164V9.3809C81.9984 8.71316 80.6452 6.93897 80.6452 4.83898C80.6452 2.17124 82.8161 0.000279784 85.4839 0.000279784C88.1516 0.000279784 90.3226 2.17124 90.3226 4.83898C90.3226 6.93897 88.9694 8.71316 87.0968 9.3809V14.5164C87.0968 18.9631 83.479 22.5809 79.0323 22.5809H74.1081C74.1435 23.118 74.1936 23.6518 74.1936 24.1938C74.1936 24.7373 74.1371 25.2696 74.1016 25.8067H88.7097C91.3774 25.8067 93.5484 23.6357 93.5484 20.968V15.8325C91.6758 15.1648 90.3226 13.3906 90.3226 11.2906C90.3226 8.62284 92.4936 6.45187 95.1613 6.45187C97.829 6.45187 100 8.62284 100 11.2906C100 13.3906 98.6468 15.1648 96.7742 15.8325V20.968C96.7742 25.4147 93.1565 29.0325 88.7097 29.0325H73.6806ZM16.129 83.871C19.029 83.871 21.7 82.8968 23.8581 81.2759C22.0435 78.871 19.1871 77.4194 16.129 77.4194C13.071 77.4194 10.2145 78.871 8.4 81.2759C10.5581 82.8968 13.229 83.871 16.129 83.871ZM16.129 74.1936C18.7968 74.1936 20.9677 72.0227 20.9677 69.3549C20.9677 66.6872 18.7968 64.5162 16.129 64.5162C13.4613 64.5162 11.2903 66.6872 11.2903 69.3549C11.2903 72.0227 13.4613 74.1936 16.129 74.1936ZM16.129 58.0646C9.01452 58.0646 3.22581 63.8533 3.22581 70.9678C3.22581 74.021 4.29677 76.8275 6.07742 79.0388C7.35484 77.4484 8.97419 76.1952 10.8048 75.3646C9.1371 73.8856 8.06452 71.7533 8.06452 69.3549C8.06452 64.9082 11.6823 61.2904 16.129 61.2904C20.5758 61.2904 24.1935 64.9082 24.1935 69.3549C24.1935 71.7533 23.121 73.8856 21.4532 75.3646C23.2839 76.1968 24.9032 77.4501 26.1806 79.0388C27.9613 76.8275 29.0323 74.021 29.0323 70.9678C29.0323 63.8533 23.2435 58.0646 16.129 58.0646ZM50 96.7742C52.9 96.7742 55.571 95.8 57.729 94.179C55.9145 91.7742 53.0581 90.3226 50 90.3226C46.9419 90.3226 44.0855 91.7742 42.271 94.179C44.429 95.8 47.1 96.7742 50 96.7742ZM50 87.0968C52.6677 87.0968 54.8387 84.9258 54.8387 82.2581C54.8387 79.5904 52.6677 77.4194 50 77.4194C47.3323 77.4194 45.1613 79.5904 45.1613 82.2581C45.1613 84.9258 47.3323 87.0968 50 87.0968ZM50 70.9678C42.8855 70.9678 37.0968 76.7565 37.0968 83.871C37.0968 86.9242 38.1677 89.7307 39.9484 91.942C41.2258 90.3516 42.8452 89.0984 44.6758 88.2678C43.0081 86.7887 41.9355 84.6565 41.9355 82.2581C41.9355 77.8113 45.5532 74.1936 50 74.1936C54.4468 74.1936 58.0645 77.8113 58.0645 82.2581C58.0645 84.6565 56.9919 86.7887 55.3242 88.2678C57.1548 89.1 58.7742 90.3533 60.0516 91.942C61.8323 89.7307 62.9032 86.9242 62.9032 83.871C62.9032 76.7565 57.1145 70.9678 50 70.9678ZM83.871 83.871C86.771 83.871 89.4419 82.8968 91.6 81.2759C89.7855 78.871 86.929 77.4194 83.871 77.4194C80.8129 77.4194 77.9565 78.871 76.1419 81.2759C78.3 82.8968 80.971 83.871 83.871 83.871ZM83.871 74.1936C86.5387 74.1936 88.7097 72.0227 88.7097 69.3549C88.7097 66.6872 86.5387 64.5162 83.871 64.5162C81.2032 64.5162 79.0323 66.6872 79.0323 69.3549C79.0323 72.0227 81.2032 74.1936 83.871 74.1936ZM83.871 58.0646C76.7565 58.0646 70.9677 63.8533 70.9677 70.9678C70.9677 74.021 72.0387 76.8275 73.8194 79.0388C75.0968 77.4484 76.7161 76.1952 78.5468 75.3646C76.879 73.8856 75.8064 71.7533 75.8064 69.3549C75.8064 64.9082 79.4242 61.2904 83.871 61.2904C88.3177 61.2904 91.9355 64.9082 91.9355 69.3549C91.9355 71.7533 90.8629 73.8856 89.1952 75.3646C91.0258 76.1968 92.6452 77.4501 93.9226 79.0388C95.7032 76.8275 96.7742 74.021 96.7742 70.9678C96.7742 63.8533 90.9855 58.0646 83.871 58.0646ZM33.4839 37.0679C35.3548 32.3131 39.2081 28.6163 43.9355 26.8841C41.7355 25.1099 40.3226 22.3954 40.3226 19.3551C40.3226 14.018 44.6629 9.67767 50 9.67767C55.3371 9.67767 59.6774 14.018 59.6774 19.3551C59.6774 22.3954 58.2645 25.1099 56.0645 26.8857C60.7903 28.6179 64.6435 32.3131 66.5145 37.0679C69.3742 33.4308 70.9677 28.9502 70.9677 24.1938C70.9677 18.2373 68.4194 12.539 63.979 8.56477C59.4758 4.53575 53.6597 2.68576 47.5919 3.36156C38.0403 4.42124 30.2968 12.1196 29.1806 21.6647C28.5226 27.2921 30.1097 32.7663 33.4839 37.0679ZM61.6306 41.9356C61.9774 41.5131 62.3355 41.134 62.7306 40.8292C63.1774 40.4873 63.5855 40.1098 64 39.7389C62.6742 34.8582 58.8823 31.0808 54.1597 29.6566L56.2048 41.9356H61.6306ZM43.7952 41.9356L45.8419 29.6566C41.1242 31.0792 37.3355 34.8486 36.0048 39.7244C36.3629 40.0453 36.7 40.3857 37.0823 40.6856C37.5548 41.0566 37.9677 41.484 38.35 41.9356H43.7952ZM50 25.8067C53.5581 25.8067 56.4516 22.9131 56.4516 19.3551C56.4516 15.797 53.5581 12.9035 50 12.9035C46.4419 12.9035 43.5484 15.797 43.5484 19.3551C43.5484 22.9131 46.4419 25.8067 50 25.8067ZM47.0645 41.9356H52.9339L50.7887 29.0679C50.5274 29.0534 50.2661 29.0325 50 29.0325C49.7339 29.0325 49.4726 29.0534 49.2097 29.0679L47.0645 41.9356ZM59.5145 51.613H40.4855C41.2355 55.2888 44.4919 58.0646 48.3871 58.0646H51.6129C55.5065 58.0646 58.7645 55.2888 59.5145 51.613ZM66.129 46.7743C66.129 45.884 65.4048 45.1614 64.5161 45.1614H35.4839C34.5952 45.1614 33.871 45.884 33.871 46.7743C33.871 47.6647 34.5952 48.3872 35.4839 48.3872H64.5161C65.4048 48.3872 66.129 47.6647 66.129 46.7743Z" fill="white" fill-opacity="0.8"/>
              </svg>
            </div>
          </a>

          <!-- Search section -->
          <div class="flex-1 flex items-center justify-center lg:justify-end">
            <div v-if="state.group && state.group.id" class="w-full px-2 lg:px-6">
              <label for="search" class="sr-only">Search by name or id</label>
              <div class="relative text-indigo-200 focus-within:text-gray-400">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon class="h-5 w-5" aria-hidden="true" />
                </div>
                <input id="search" name="search" v-model="state.search" class="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-indigo-400 bg-opacity-25 text-indigo-100 placeholder-indigo-200 focus:outline-none focus:bg-white focus:ring-0 focus:placeholder-gray-400 focus:text-gray-900 sm:text-sm" placeholder="Search" type="search" />
              </div>
            </div>
            <Menu as="div" class="ml-3 relative">
              <MenuButton class="max-w-xs py-1 px-2 text-indigo-100 flex items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-100">
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
                    <label :for="'act'+item.id" class="block bg-gray-50 rounded-md w-full py-2 px-4 text-sm flex items-center">
                      <input :id="'act'+item.id" v-model="state.filteredActivities" :value="item.id" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 mr-2 text-indigo-600 border-gray-300 rounded" />
                      <p>{{ item.name }}</p>
                    </label>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
          <div class="flex lg:hidden">
            <!-- Mobile menu button -->
            <DisclosureButton class="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-indigo-400 hover:text-white hover:bg-indigo-600 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-indigo-600 focus:ring-white">
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
                <MenuButton class="max-w-xs py-1 px-2 text-indigo-100 flex items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-100">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="ml-2">{{ group.name }}</p>
                </MenuButton>
                <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
                  <MenuItems class="origin-top-right absolute z-10 right-0 mt-2 w-48 max-h-64 overflow-y-auto rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem v-for="item in groups" :key="item.id">
                      <button @click="bcc_store.setGroup(item)" :disabled="item.id == state.group.id"
                              :class="item.id == state.group.id ? 'text-indigo-600 bg-indigo-100 font-medium' : 'text-gray-700'"
                              class="block bg-gray-50 rounded-md w-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500">{{ item.name }}</button>
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
                    :class="item.id == state.group.id ? 'text-indigo-600 bg-indigo-100 font-medium' : 'bg-white text-gray-700'"
                    class="block py-2 px-4 my-1 text-sm focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500">{{ item.name }}</button>
          </template>
        </div>
      </DisclosurePanel>
    </Disclosure>

    <v-progress-linear :indeterminate="state.loading > 0" />

    <!-- 3 column wrapper -->
    <div class="flex-grow flex flex-col md:flex-row w-full max-w-7xl mx-auto xl:px-8 bg-gray-50">
      <!-- Start left column area -->
      <div class="order-3 md:order-1 w-full md:w-1/3 lg:w-1/4 md:sticky top-0">
        <div class="h-full relative">
          <div class="md:absolute inset-0 p-6 overflow-hidden overflow-y-auto rounded-lg">
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
            <label for="allow overbook" class="block bg-gray-50 rounded-md w-full py-2 px-4 text-sm flex items-center">
              <input id="allow overbook" v-model="overbook" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 mr-2 text-indigo-600 border-gray-300 rounded" />
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
          <div class="md:absolute inset-0 p-6 overflow-hidden overflow-y-auto rounded-lg">
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