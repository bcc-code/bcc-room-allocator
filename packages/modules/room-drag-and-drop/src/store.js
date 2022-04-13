import {reactive, watchEffect} from 'vue'
import mockRegistrations from "./mock-data/mockRegistrations";
import mockRooms from "./mock-data/mockRooms";
import mockActivities from "./mock-data/mockActivities";
import mockGroups from "./mock-data/mockGroups";
import AutoAssign from "./room-algorithm";
import mockEvents from "./mock-data/mockEvents";

class store {
    state = reactive({
        loading: 0,
        status: '',
        user: null,
        event: null,
        group: null,
        groups: {},
        rooms: null,
        activities: {},
        registrations: null,
        boys: null,
        girls: null,
        search: '',
        selection: [],
        selected: {},
        selectGroup: '',
        filteredAge: {min: 0, max: 120},
        filteredActivities: [],
    })

    constructor(user, api) {
        this.state.user = user
        this.api = api

        watchEffect(() => {
            this.state.selection = Object.keys(this.state.selected).filter(id => this.state.selected[id])
        })
    }

    loader (steps = 1) {
        const state = this.state
        state.loading += steps

        return {
            step () {
                --steps
                --state.loading
            },
            finished () {
                state.loading -= steps
                if (state.loading < 1) {
                    state.loading = 0
                    state.status = ''
                }
            }
        }
    }

    async loadEvents() {
        const loading = this.loader()
        try {
            this.state.events = null

            if (this.api) {
                const params = new URLSearchParams({
                    limit: -1,
                    fields: [
                        'id', 'title', 'start_date'
                    ]
                })

                await this.api.get(`/items/events?${params}`).then((res) => {
                    this.state.events = res.data.data.sort((a,b) => a.start_date > b.start_date ? 1 : -1)
                });
            } else {
                this.state.events = mockEvents
            }
        } catch (err) {
            console.error(err)
        }

        loading.finished()
    }

    setGroup(group) {
        if (group.id && group.id != this.state.group?.id) {
            this.state.group = group
            this.loadRegistrations(group.id)
            this.loadRooms(group.id)
        }
    }

    async loadGroups() {
        const loading = this.loader()
        try {
            this.state.groups = null

            if (this.api) {
                const params = new URLSearchParams({
                    limit: -1,
                    fields: [
                        'id', 'name'
                    ]
                })

                await this.api.get(`/items/groups?${params}`).then((res) => {
                    this.state.groups = res.data.data.sort((a,b) => a.name > b.name ? 1 : -1)
                });
            } else {
                this.state.groups = mockGroups
            }
        } catch (err) {
            console.error(err)
        }

        loading.finished()
    }

    async loadActivities() {
        const loading = this.loader()
        try {
            this.state.activities = null
            if (this.api) {
                const params = new URLSearchParams({
                    limit: -1,
                    fields: [
                        'id', 'name'
                    ]
                })

                await this.api.get(`/items/activities?${params}`).then((res) => {
                    const activities = {}
                    res.data.data.forEach(activity => activities[activity.id] = activity);
                    this.state.activities = activities;
                });
            } else {
                this.state.activities = mockActivities
            }
        } catch (err) {
            console.error(err)
        }

        loading.finished()
    }

    async loadRegistrations(groupId) {
        const loading = this.loader()
        try {
            this.state.registrations = null
            this.state.boys = null
            this.state.girls = null
            if (groupId) {
                if (this.api) {
                    const params = new URLSearchParams({
                        limit: -1,
                        filter: JSON.stringify({
                            group: {
                                _eq: groupId
                            },
                            event: {
                                _eq: this.state.event.id
                            }
                        }),
                        fields: ['*', 'activities.activity']
                    })
                    await this.api.get(`/items/registrations?${params}`).then((res) => {
                        this.state.registrations = res.data.data.map(reg => ({
                            ...reg,
                            activities: reg.activities.map(a => a.activity)
                        })).sort((a,b) => a.age > b.age ? 1 : -1)
                    });
                } else {
                    this.state.registrations = mockRegistrations
                }
            }
        } catch (err) {
            console.error(err)
        }

        loading.finished()
    }

    async loadRooms(groupId) {
        const loading = this.loader()
        try {
            this.state.rooms = null
            if (groupId) {
                const params = new URLSearchParams({
                    limit: -1,
                    filter: JSON.stringify({
                        group: {
                            _eq: groupId
                        },
                        event: {
                            _eq: this.state.event.id
                        }
                    }),
                    fields: ['*']
                })

                if (this.api) {
                    await this.api.get(`/items/rooms?${params}`).then((res) => {
                        this.state.rooms = res.data.data
                    });
                } else {
                    this.state.rooms = mockRooms
                }
            }
        } catch (err) {
            console.error(err)
        }

        loading.finished()
    }

    async setRoom(registrationId, roomId) {
        const loading = this.loader()
        try {
            if (this.state.selected[registrationId]) {
                this.state.selected[registrationId] = false
            }

            if (this.api) {
                const params = new URLSearchParams({
                    fields: ['*', 'activities.activity']
                })

                await this.api.patch(`/items/registrations/${registrationId}?${params}`, { room: roomId }).then((res) => {
                    const registration = res.data.data
                    this.state.registrations = this.state.registrations.map(reg => {
                        if (reg.id == registration.id) {
                            reg = {
                                ...registration,
                                activities: registration.activities.map(a => a.activity)
                            }
                        }
                        return reg
                    })
                });
            } else {
                this.state.registrations = this.state.registrations.map(reg => {
                    if (reg.id == registrationId) {
                        reg = {
                            ...reg,
                            room: roomId
                        }
                    }
                    return reg
                })
            }
        } catch (err) {
            console.error(err)
        }

        loading.finished()
    }

    async updateRoom (room, data) {
        const loading = this.loader()
        try {
            if (this.api) {
                await this.api.patch(`/items/rooms/${room.id}`, data).then((res) => {
                    Object.entries(res.data.data).forEach(([key, value]) => {
                        room[key] = value
                    })
                });
            } else {
                Object.entries(data).forEach(([key, value]) => {
                    room[key] = value
                })
            }
        } catch (err) {
            console.error(err)
        }
        loading.finished()
    }

    async toggleComplete(roomId) {
        if (this.busy) { return }
        this.busy = true

        const room = this.state.rooms.find(r => r.id == roomId)
        if (! room) throw new Error('Room not found')

        await this.updateRoom(room, {
            is_complete: !room.is_complete
        })

        this.state.selectGroup = ''
        this.state.selected = {}

        this.busy = false
    }

    async magicAssign(registrations, allowOverbooking) {
        if (this.busy) { return }
        this.busy = true
        const loading = this.loader()

        try {
            this.state.status = 'Starting up the magic...'
            const Assigner = new AutoAssign(this.state, registrations, allowOverbooking)
            const solution = await Assigner.run((status) => {
                this.state.status = status
            })
            this.state.status = 'Assigning guests to their rooms...'
            const Q = solution.roomsMap.map((room, roomId) => {
                const q = room.guests.map(reg => this.setRoom(reg.id, roomId))
                return Promise.all(q)
            })
            await Promise.all(Q)

            this.state.status = 'Done!'
        } catch (err) {
            console.error(err)
            this.state.status = 'Error: ' + err.message
        }

        loading.finished()
        this.busy = false
    }
}

export default store