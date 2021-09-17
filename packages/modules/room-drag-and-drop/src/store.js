import {reactive, watchEffect} from 'vue'
import mockRegistrations from "./mock-data/mockRegistrations";
import mockRooms from "./mock-data/mockRooms";
import mockActivities from "./mock-data/mockActivities";
import mockGroups from "./mock-data/mockGroups";

class store {
    state = reactive({
        loading: 0,
        user: null,
        group: {id: 0, name: ''},
        groups: {},
        rooms: null,
        activities: {},
        registrations: null,
        boys: null,
        girls: null,
        search: '',
        selection: [],
        selected: {},
        selectGroup: 'null',
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
                }
            }
        }
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
            this.state.events = null

            const params = new URLSearchParams({
                limit: -1,
                fields: [
                    'id', 'name'
                ]
            })

            if (this.api) {
                await this.api.get(`/items/groups?${params}`).then((res) => {
                    this.state.groups = res.data.data.sort((a,b) => a.name > b.name ? 1 : -1)
                });
            } else {
                this.state.groups = mockGroups
            }

            if (this.state.groups.length) {
                this.setGroup(this.state.groups[0])
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
            const params = new URLSearchParams({
                limit: -1,
                fields: [
                    'id', 'name'
                ]
            })

            if (this.api) {
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
                const params = new URLSearchParams({
                    limit: -1,
                    filter: JSON.stringify({
                        group: {
                            _eq: groupId
                        }
                    }),
                    fields: ['*', 'activities.activity']
                })

                if (this.api) {
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

    async magicAssign(registrations, allowOverbooking) {
        if (this.busy) { return }
        this.busy = true
        const loading = this.loader(registrations.length + 1)
        try {
            let roomsMap = {}

            let totalCapacity = 0
            this.state.rooms.forEach(r => {
                roomsMap[r.id] = { ...r,
                    ageAvg: 0,
                    ageTotal: 0,
                    taken: 0,
                    guests: [],
                    activities: {},
                    gender: null
                }
                totalCapacity += r.capacity
            })

            const addReg = (reg, room) => {
                --totalCapacity
                room.taken = room.guests.push(reg)
                room.gender = room.gender || reg.gender
                room.ageTotal += reg.age
                room.ageAvg = room.ageTotal / room.taken
                reg.activities.forEach(({activity}) => {
                    room.activities[activity] = (room.activities[activity] || 0) + 1
                })

                return true
            }

            this.state.registrations.forEach(reg => {
                if (reg.room) {
                    addReg(reg, roomsMap[reg.room])
                }
            })

            const regs = registrations.sort((a, b) => a.activities.length > b.activities.length || (Math.random() > .5) ? 1 : -1);

            const rooms = Object.values(roomsMap)
            regs.forEach(reg => {
                const scores = {}
                rooms.forEach(room => {
                    if (!room.gender || room.gender === reg.gender) {
                        scores[room.id] = 0
                        scores[room.id] += room.taken < room.capacity ? 1 : room.capacity - room.taken - 100
                        scores[room.id] += reg.activities.reduce(((num, a) => num + (room.activities[a] || 0)), -1) * 2
                        scores[room.id] += reg.age > (room.ageAvg * 1.5) ? 2 : 0
                    }
                })

                let sortedScores = Object.entries(scores).sort(([ida, a],[idb, b]) => a > b ? -1 : 1)
                sortedScores = sortedScores.filter(([id, s]) => s === sortedScores[0][1])
                if (sortedScores.length) {
                    const random = Math.floor(Math.random() * sortedScores.length)
                    const [roomId] = sortedScores[random]

                    const room = roomsMap[roomId]
                    if (room.taken < room.capacity || allowOverbooking) {
                        addReg(reg, room)
                        this.setRoom(reg.id, roomId)
                    }
                }

                loading.step()
            })
        } catch (err) {
            console.error(err)
        }

        loading.finished()
        this.busy = false
    }
}

export default store