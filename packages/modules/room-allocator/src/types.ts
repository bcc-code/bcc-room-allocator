import {Item} from "directus/dist/types";

// @ts-ignore
export type sID<T> = string
// @ts-ignore
export type nID<T> = number

export interface Room extends Item {
    id: nID<Room>
    name: string
    capacity: number
    group: number
    gender: string
    arrival: string | null
    departure: string | null
    features?: Array<string>
    is_complete?: boolean
    is_reviewed?: boolean
    event?: sID<Event>
}

export interface ScoredRoom extends Room {
    score: number
    taken: number
    ageAvg: number
    ageTotal: number
    mentors: number
    activities: Record<number, number>
    guests: Array<Registration>
}

export interface Activity extends Item {
    id: nID<Activity>
    name: string
}

export interface Registration extends Item {
    id: sID<Registration>
    name: string
    age: number
    gender: string
    allergy?: any
    group: number
    room?: any
    date_updated?: any
    status: boolean
    event: string
    personId: string
    tags?: Array<string>
    activities: Array<{ activity: number }>
}

export interface Activity extends Item {
    id: nID<Activity>
    name: string
}

export interface Event extends Item {
    id: string
    title: string
    start_date?: string
    end_date?: string
}

export interface Group extends Item {
    id: number
    name: string
}