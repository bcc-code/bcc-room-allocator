import type Store from "./store";
import {Registration, Room, ScoredRoom} from "./types";

export default class AutoAssign {
    rooms: Array<Room> = []
    existingRegistrations: Array<Registration> = []
    registrations: Array<Registration> = []
    allowOverbooking: boolean = false

    samples = 3

    constructor (store: Store, registrations: Array<Registration>, allowOverbooking: boolean, samples?: number) {
        this.rooms = store.rooms.value
        this.existingRegistrations = store.registrations.value
        this.registrations = registrations
        this.allowOverbooking = allowOverbooking

        this.samples = samples ?? Math.ceil(registrations.length / 3) + 1
    }

    async run (statusCb = (msg: string) => { console.debug(msg)}) {
        let bestSolution = this.createSolution()
        if (! this.registrations.length) {
            return bestSolution
        }
        statusCb(`First initial solution: ${bestSolution.totalScore}`)

        const queue = []
        for (let i=0; i<this.samples; ++i) {
            queue.push(new Promise(resolve => {
                setTimeout(() => {
                    const solution = this.createSolution()

                    if (solution.totalScore > bestSolution.totalScore) {
                        bestSolution = solution
                        statusCb(`Better solution found #${i}: ${bestSolution.totalScore}`)
                    }

                    resolve(solution)
                }, 50 * i)
            }))
        }

        await Promise.all(queue)

        return bestSolution
    }

    addReg (reg: Registration, room: ScoredRoom, score?: number) {
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
        reg.activities.forEach(({ activity }) => {
            room.activities[activity] = (room.activities[activity] || 0) + 1
        })

        return score
    }

    getScore (room: ScoredRoom, reg: Registration) {
        let score = reg.activities.reduce(((num, { activity } ) => {
            return num + (room.activities[activity] || 0)
        }), 0) * 2
        score += room.taken < room.capacity ? 2 : room.capacity - room.taken - 50
        score += reg.age > room.ageAvg ? 1 : 0

        return score
    }

    createRoomsMap () {
        const roomsMap: Map<number, ScoredRoom> = new Map()

        this.rooms.forEach(r => roomsMap.set(r.id, { ...r,
            ageAvg: 0,
            ageTotal: 0,
            taken: 0,
            score: 0,
            guests: [],
            activities: {}
        }))

        this.existingRegistrations.forEach(reg => {
            if (reg.room) {
                const room = roomsMap.get(reg.room)
                if (room) {
                    this.addReg(reg, room, this.getScore(room, reg))
                } else {
                    reg.room = null
                }

            }
        })

        return roomsMap
    }

    createSolution () {
        const roomsMap = this.createRoomsMap()
        const regs = this.registrations.sort((a, b) => a.activities.length > b.activities.length || (Math.random() > .5) ? -1 : 1)

        regs.forEach(reg => {
            const scores: Map<number, Array<ScoredRoom>> = new Map()
            let highestScore = -100

            roomsMap.forEach((room) => {
                if (!room.gender || room.gender === reg.gender) {
                    const score = this.getScore(room, reg)
                    if (! scores.has(score)) {
                        scores.set(score, [])
                    }
                    scores.get(score)!.push(room)
                    if (score > highestScore) {
                        highestScore = score
                    }
                }
            })

            const highestScoredRooms = scores.get(highestScore)
            if (highestScoredRooms && highestScoredRooms.length) {
                highestScoredRooms.sort((a,b) => (a.capacity - a.taken) > (b.capacity - b.taken) ? -1 : 1)
                const room = highestScoredRooms[0]!
                /* const random = Math.floor(Math.random() * highestScoredRooms.length)
                const room = highestScoredRooms[random] */
                if (room.taken < room.capacity || this.allowOverbooking) {
                    this.addReg(reg, room, highestScore)
                }
            }
        })

        let totalScore = 0
        let totalGuests = 0
        roomsMap.forEach(room => {
            totalScore += room.score
            totalGuests += room.guests.length
        })

        return {
            roomsMap,
            totalScore,
            totalGuests
        }
    }
}