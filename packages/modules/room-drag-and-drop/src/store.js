import {reactive, watchEffect} from 'vue'

class store {
    state = reactive({
        loading: true,
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
            if (this.state.group) {
                this.loadRegistrations(this.state.group.id)
                this.loadRooms(this.state.group.id)
            }
        })

        watchEffect(() => {
            this.state.selection = Object.keys(this.state.selected).filter(id => this.state.selected[id])
        })
    }

    async loadGroups() {
        this.state.loading = true
        this.state.events = null

        const now = new Date()

        const params = new URLSearchParams({
            limit: -1,
            fields: [
                'id', 'name'
            ]
        })

        if (this.api) {
            await this.api.get(`/items/groups?${params}`).then((res) => {
                this.state.groups = {};
                res.data.data.forEach(group => {
                    this.state.groups[group.id] = group
                    if (! this.state.group?.id) {
                        this.state.group = group
                    }
                });
            });
        } else {
            const group = {
                id: 1,
                name: 'Horten'
            }

            this.state.group = group
            this.state.groups = {
                1: group,
                2: {
                    id: 2,
                    name: 'Drammen'
                }
            }
        }
        this.state.loading = true
    }

    async loadActivities() {
        this.state.loading = true
        this.state.activities = null

        const now = new Date()

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
            this.state.activities = {
                1: {
                    id: 1,
                    name: 'Football'
                },
                2: {
                    id: 2,
                    name: 'Media'
                }
            }
        }
        this.state.loading = true
    }

    async loadRegistrations(groupId) {
        this.state.loading = true

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
                    }))
                });
            } else {
                this.state.registrations = [
                    {
                        id: 1,
                        name: 'John Doe',
                        gender: 'Male',
                        age: 14,
                        activities: [1]
                    }, {
                        id: 2,
                        name: 'Mary Anne',
                        gender: 'Male',
                        age: 17,
                        activities: [2]
                    }, {
                        id: 3,
                        name: 'Josy Comfort',
                        gender: 'Male',
                        age: 19,
                        activities: []
                    }, {
                        id: 4,
                        name: 'Marc Brown',
                        gender: 'Male',
                        age: 28,
                        activities: [1, 2],
                        room: 1
                    }, {
                        id: 5,
                        name: 'Sophie Garden',
                        gender: 'Male',
                        age: 25,
                        activities: [2]
                    }, {
                        id: 6,
                        name: 'Ben Marco',
                        gender: 'Male',
                        age: 15,
                        activities: [1]
                    }, {
                        id: 7,
                        name: 'Claud Marco',
                        gender: 'Male',
                        age: 13,
                        activities: [2]
                    }, {
                        id: 8,
                        name: 'Free Morrow',
                        gender: 'Male',
                        age: 17,
                        activities: [2]
                    }, {
                        id: 9,
                        name: 'James Run',
                        gender: 'Male',
                        age: 17,
                        activities: [1]
                    }, {
                        id: 10,
                        name: 'Long Last',
                        gender: 'Male',
                        age: 27,
                        activities: []
                    }
                ]
            }
        }
        this.state.loading = false
    }

    async loadRooms(groupId) {
        this.state.loading = true

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
                this.state.rooms = [
                    {
                        id: 1,
                        name: '12 201',
                        capacity: 3
                    }, {
                        id: 2,
                        name: '10 406',
                        capacity: 2
                    }, {
                        id: 3,
                        name: '10 407',
                        capacity: 3
                    }
                ]
            }
        }
        this.state.loading = false
    }

    async setRoom(registrationId, roomId) {
        this.state.loading = true

        if (this.state.selected[registrationId]) {
            this.state.selected[registrationId] = false
        }

        if (this.api) {
            await this.api.patch(`/items/registrations/${registrationId}`, { room: roomId }).then((res) => {
                const registration = res.data.data
                this.state.registrations = this.state.registrations.map(reg => {
                    if (reg.id == registrationId) {
                        reg = registration
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
        this.state.loading = false
    }

    async magicAssign(registrations, allowOverbooking) {
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

        const regs = registrations.sort(() => (Math.random() > .5) ? 1 : -1);

        const rooms = Object.values(roomsMap)
        regs.forEach(reg => {
            if (totalCapacity < 1 && ! allowOverbooking) {
                return
            }

            const scores = {}
            rooms.find(room => {
                if (! room.gender || room.gender === reg.gender) {
                    scores[room.id] = 0
                    scores[room.id] += room.taken < room.capacity ? 1 : totalCapacity < 1 ? room.capacity - room.taken : -10
                    scores[room.id] += reg.activities.filter(a => room.activities[a]).length * 3
                    scores[room.id] += reg.age > (room.ageAvg * 1.5) ? 2 : 0
                }
            })

            const roomIds = Object.keys(scores)
            if (roomIds.length) {
                let largest = {id: roomIds[0], s: scores[roomIds[0]]}
                roomIds.forEach(id => {
                    if (largest.s < scores[id]) {
                        largest = {id, s: scores[id]}
                    }
                })

                addReg(reg, roomsMap[largest.id])
                this.setRoom(reg.id, largest.id)
            }
        })
    }
}

export default store