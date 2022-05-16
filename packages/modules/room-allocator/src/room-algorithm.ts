import type Store from "./store";
import {Registration, Room, ScoredRoom} from "./types";


export default class AutoAssign {
    rooms: Array<Room> = []
    existingRegistrations: Array<Registration> = []
    registrations: Array<Registration> = []
    allowOverbooking: boolean = false

    minMentors = 0.3
    mentorAge = 21
    samples = 3

    constructor (store: Store, registrations: Array<Registration>, allowOverbooking: boolean, samples?: number) {
        this.mentorAge = store.state.minMentorAge
        this.minMentors = store.state.minMentors / 100

        this.rooms = store.rooms.value
        this.existingRegistrations = store.registrations.value
        this.registrations = registrations
        this.allowOverbooking = allowOverbooking

        this.samples = samples ?? Math.round(registrations.length / 3) + 3
    }

    async run (statusCb = (msg: string) => { console.debug(msg)}) {
        let bestSolution = this.createSolution(0)
        if (! this.registrations.length) {
            return bestSolution
        }
        statusCb(`First initial solution: ${bestSolution.totalScore}`)

        const sleep = (ms = 50) => {
            return new Promise(resolve => setTimeout(resolve, ms))
        }

        await sleep(100)

        for (let i=0; i<this.samples; ++i) {
            const solution = this.createSolution(i / this.samples)

            if (solution.totalScore > bestSolution.totalScore) {
                bestSolution = solution
                statusCb(`Better solution found #${i}: ${bestSolution.totalScore}`)
                await sleep(100)
            }
        }

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
        room.mentors = room.guests.filter(r => r.age >= this.mentorAge).length
        reg.activities.forEach(({ activity }) => {
            room.activities[activity] = (room.activities[activity] || 0) + 1
        })

        return score
    }

    getScore (room: ScoredRoom, reg: Registration) {
        let score = reg.activities.reduce(((num, { activity } ) => {
            return num + (room.activities[activity] || 0)
        }), 0) / (room.taken || 1)

        score += (1 - (room.taken/room.capacity))


        const mentorQuota = room.mentors/room.capacity
        score += reg.age >= this.mentorAge ? (1 - mentorQuota) : mentorQuota < this.minMentors ? -1 : 0

        score += reg.age > room.ageAvg ? 1 : 0

        return score * 20 * (reg.age < this.mentorAge && mentorQuota > this.minMentors ? 2 : 1)

        /*const input = {
            // r = related activities in common
            r: reg.activities.reduce(((num, { activity } ) => {
                return num + (room.activities[activity] || 0)
            }), 0) / (room.taken || 1),

            // c = room capacity filled
            c: 1 - (room.taken/room.capacity),
            // m = percentage of mentor in group
            m: reg.age >= this.mentorAge ? (1 - (room.guests.filter(r => r.age >= this.mentorAge).length/room.capacity)) : 0,
            // a = has above average age
            a: room.ageAvg && reg.age > room.ageAvg ? 1 - room.ageAvg/reg.age : 0,
        }

        let score = net.run(input)

        return room.taken === room.capacity ? score - 80 : score * 40 */

        /*score += room.taken < room.capacity ? 2 - (room.taken / room.capacity) : room.capacity - room.taken - 100

        score += reg.age > this.mentorAge ? 1 : reg.age > room.ageAvg ? 1 : 0


        if (room.taken > Math.ceil(room.capacity * (1 - this.minMentors))) {
            score += reg.age >= this.mentorAge ? room.ageAvg - reg.age : (reg.age - this.mentorAge) * 2
        }

        return score*/
    }

    createRoomsMap () {
        const roomsMap: Map<number, ScoredRoom> = new Map()

        this.rooms.forEach(r => roomsMap.set(r.id, { ...r,
            ageAvg: 0,
            ageTotal: 0,
            taken: 0,
            score: 0,
            guests: [],
            activities: {},
            mentors: 0,
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

    createSolution (i = 0.5) {
        const roomsMap = this.createRoomsMap()
        let regs = this.registrations

        regs.sort(() => Math.random() - i)

        regs = [...regs.filter(r => r.age < this.mentorAge), ...regs.filter(r => r.age >= this.mentorAge)]

        regs.forEach(reg => {
            const scores: Map<number, Array<ScoredRoom>> = new Map()
            let highestScore = -200

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
                //const room = highestScoredRooms[0]!
                const random = Math.floor(Math.random() * highestScoredRooms.length)
                const room = highestScoredRooms[random]!
                if (room.taken < room.capacity || this.allowOverbooking) {
                    this.addReg(reg, room, highestScore)
                }
            }
        })

        let totalScore = 0
        let lowestScore = 10000
        let totalGuests = 0
        roomsMap.forEach(room => {
            totalScore += room.score
            if (lowestScore > room.score) {
                lowestScore = room.score
            }
            totalGuests += room.guests.length
        })

        return {
            roomsMap,
            totalScore: lowestScore/totalScore * 1000,
            totalGuests
        }
    }
}