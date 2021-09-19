import {readonly} from "vue";

export default class AutoAssign {
    rooms = []
    existingRegistrations = []
    registrations = []
    allowOverbooking = false

    samples = 3

    constructor (state, registrations, allowOverbooking, samples = 10) {
        this.rooms = readonly(state.rooms)
        this.existingRegistrations = state.registrations
        this.registrations = registrations.sort((a, b) => a.activities.length > b.activities.length || (Math.random() > .5) ? 1 : -1);
        this.allowOverbooking = allowOverbooking

        this.samples = samples
    }

    async run () {
        let bestSolution = this.createSolution()
        if (! this.registrations.length) {
            return bestSolution
        }
        console.log(-1, bestSolution.totalScore)
        const queue = []
        for (let i=0; i<this.samples; ++i) {
            queue.push(new Promise(resolve => {
                setTimeout(() => {
                    const solution = this.createSolution()
                    console.log(i, solution.totalScore)

                    if (solution.totalScore > bestSolution.totalScore) {
                        bestSolution = solution
                    }

                    resolve(solution)
                }, 1000)
            }))
        }

        await Promise.all(queue)

        return bestSolution
    }

    addReg (reg, room, score = null) {
        if (! reg || ! room) {
            throw Error(`Reg and room is required in 'addReg': ${reg}, ${room}`)
        }
        if (! score) {
            score = this.getScore(room, reg)
        }
        room.score += score
        room.guests.push(reg)
        room.gender = room.gender || reg.gender
        room.ageTotal += reg.age
        room.ageAvg = room.ageTotal / ++room.taken
        reg.activities.forEach((activity) => {
            room.activities[activity] = (room.activities[activity] || 0) + 1
        })

        return score
    }

    getScore (room, reg) {
        if (!window.getScore) {
            window.getScore = (room, reg) => {
                let score = reg.activities.reduce(((num, a) => {
                    return num + (room.activities[a] || 0)
                }), 0) * 2
                score += room.taken < room.capacity ? 2 : room.capacity - room.taken - 100
                score += room.ageAvg ? (reg.age > (room.ageAvg * 1.5)) * 1 : 1

                return score
            }
        }

        return  window.getScore(room, reg)
    }

    createRoomsMap () {
        const roomsMap = new Map()

        this.rooms.forEach(r => roomsMap.set(r.id, { ...r,
            ageAvg: 0,
            ageTotal: 0,
            taken: 0,
            score: 0,
            guests: [],
            activities: {},
            gender: null
        }))

        this.existingRegistrations.forEach(reg => {
            if (reg.room) {
                this.addReg(reg, roomsMap.get(reg.room))
            }
        })

        return roomsMap
    }

    createSolution () {
        const roomsMap = this.createRoomsMap()

        this.registrations.forEach(reg => {
            const scores = new Map()
            let highestScore = -100

            roomsMap.forEach((room, id) => {
                if (!room.gender || room.gender === reg.gender) {
                    const score = this.getScore(room, reg)
                    if (! scores.has(score)) {
                        scores.set(score, [])
                    }
                    scores.get(score).push(id)
                    if (score > highestScore) {
                        highestScore = score
                    }
                }
            })

            const highestScoredRooms = scores.get(highestScore)
            if (highestScoredRooms.length) {
                const random = Math.floor(Math.random() * highestScoredRooms.length)
                const roomId = highestScoredRooms[random]

                const room = roomsMap.get(roomId)
                if (room.taken < room.capacity || this.allowOverbooking) {
                    this.addReg(reg, room, highestScore)
                }
            }
        })

        let totalScore = 0
        roomsMap.forEach(room => totalScore += room.score)

        return {
            roomsMap,
            totalScore
        }
    }
}