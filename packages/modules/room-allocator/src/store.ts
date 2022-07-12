import {computed, reactive, ref, Ref} from "vue";
import {Activity, Event, Group, nID, Registration, Room, sID} from "./types";
import {useApi, useItems} from "@directus/extensions-sdk";
import {AxiosInstance} from "axios";

export type localState = {
    loading: number;

    preview: boolean,
    minMentors: number,
    minMentorAge: number,

    responseError: Error | Record<string, any> | null
    errors: Array<string>;

    status: string,
    alert: string,
    askToConfirm: {
        question: string,
        yes: Function,
        no: Function,
    } | null

    selectedGroup: Group | null;
    selectedEvent: Event | null;

    selectionId: string;
    selected: Record<string, boolean>;

    search: string;

    showBoyRooms: boolean,
    showGirlRooms: boolean,

    sortBy: 'age' | 'name',
}

class Store {
    public state = reactive<localState>({
        loading: 0,

        preview: false,
        minMentors: 25,
        minMentorAge: 21,

        responseError: null,
        errors: [],

        status: '',
        alert: '',
        askToConfirm: null,

        selectedGroup: null,
        selectedEvent: null,

        selectionId: '',
        selected: {},

        search: '',

        showBoyRooms: true,
        showGirlRooms: true,

        sortBy: 'age',
    })

    public scope = computed<any>(() => {
        if (this.state.selectedGroup && this.state.selectedEvent) {
            return {
                _and: [
                    { group: { _eq: this.state.selectedGroup.id }},
                    { event: { _eq: this.state.selectedEvent.id }},
                ]
            }
        }

        return { id: { _null: true } }
    })

    public roomCollection;
    public registrationCollection;

    public eventCollection = useItems(ref('events'), {
        limit: ref(-1),
        fields: ref(['id', 'title', 'start_date', 'end_date']),
        filter: ref({status: { _eq: 'published' }}),
        sort: ref(['-start_date']),
        page: ref(1),
        search: ref(''),
    })

    public activitiesCollection = useItems(ref('activities'), {
        limit: ref(-1),
        fields: ref(['id', 'name']),
        filter: ref({}),
        sort: ref(['name']),
        page: ref(1),
        search: ref(''),
    })

    public groupCollection = useItems(ref('groups'), {
        limit: ref(-1),
        fields: ref(['id', 'name', 'country']),
        filter: ref({}),
        sort: ref(['name']),
        page: ref(1),
        search: ref(''),
    })

    public groups: Ref<Group[]>;
    public events: Ref<Event[]>;
    public rooms: Ref<Room[]>;
    public registrations: Ref<Registration[]>;
    public activites: Ref<Activity[]>;

    public selection = computed(() => {
        const ids: Array<string> = []
        Object.entries(this.state.selected).forEach(([id, selected]) => {
            if (selected) {
                ids.push(id)
            }
        })

        return ids
    })

    public api: AxiosInstance;

    protected busy: boolean = false;

    constructor() {
        this.roomCollection = useItems(ref('rooms'), {
            limit: ref(-1),
            filter: computed(() => ({
                _or: [
                    this.scope.value,
                    {
                        id: {
                            _eq: 999999
                        }
                    }
                ]
            })),
            fields: ref([
                'name',
                'capacity',
                'group',
                'gender',
                'arrival',
                'departure',
                'features',
                'requests',
                'is_complete',
                'is_reviewed'
            ]),
            sort: ref(['name']),
            page: ref(1),
            search: ref(''),
        })

        this.registrationCollection = useItems(ref('registrations'), {
            limit: ref(-1),
            filter: this.scope,
            fields: ref(['*', 'activities.activity']),
            sort: ref(['person_id']),
            page: ref(1),
            search: ref(''),
        })
        this.groups = this.groupCollection.items as Ref<Group[]>
        this.events = this.eventCollection.items as Ref<Event[]>
        this.rooms = this.roomCollection.items as Ref<Room[]>
        this.registrations = this.registrationCollection.items as Ref<Registration[]>
        this.activites = this.activitiesCollection.items as Ref<Activity[]>

        this.api = useApi()
    }

    public setError(error: string) {
        this.state.errors.push(error)
        setTimeout(() => {
            this.state.errors.splice(0,1)
        }, 3000 + (this.state.errors.length * 1000))
    }

    public setSelectedGroup(group: Group | number) {
        const groupId: number = typeof group === 'number' ? group : group.id
        this.state.selectedGroup = this.groups.value.find(e => e.id === groupId) ?? null;
    }

    public setSelectedEvent(event: Event | string) {
        const eventId = typeof event === 'string' ? event : event.id
        this.state.selectedEvent = this.events.value.find(e => e.id === eventId) ?? null;
    }

    async clearFromRoom() {
        return this.selection.value.map((regId) => this.setRoom(regId, null))
    }

    async setRoom(registrationId: sID<Registration>, roomId: nID<Room> | null) {
        if (this.state.preview) {
            this.registrations.value.find(r => r.id === registrationId)!.room = roomId
            return
        }
        ++this.state.loading

        try {
            if (this.state.selected[registrationId]) {
                this.state.selected[registrationId] = false
            }

            const { data } = await this.api.patch(`/items/registrations/${registrationId}`, { room: roomId }, {
                params: {
                    fields: ['*', 'activities.activity']
                }
            })

            const reg = data.data
            const regIndex = this.registrations.value.findIndex(r => r.id === reg.id)
            if (regIndex >= 0) {
                this.registrations.value[regIndex] = reg
            } else {
                this.registrations.value.push(reg)
            }
        } catch (err: any) {
            this.state.responseError = err
            console.error(err)
        }

        --this.state.loading
    }

    async updateRoom (room: Room, payload: Partial<Room>) {
        ++this.state.loading
        try {
            const { data } = await this.api.patch(`/items/rooms/${room.id}`, payload)
            Object.entries(data.data).forEach(([key, value]) => {
                room[key] = value
            })
        } catch (err: any) {
            this.state.responseError = err
            console.error(err)
        }
        --this.state.loading
    }

    async toggleComplete(roomId: nID<Room>) {
        if (this.busy) { return }
        this.busy = true

        const room = this.rooms.value.find(r => r.id == roomId)
        if (! room) throw new Error('Room not found')

        await this.updateRoom(room, {
            is_complete: !room.is_complete
        })

        this.state.selected = {}

        this.busy = false
    }

    confirm(question: string, callback?: (answer: boolean) => void) {
        return new Promise((resolve) => {
            this.state.askToConfirm = {
                question,
                yes: () => {
                    this.state.askToConfirm = null
                    callback && callback(true)
                    resolve(true)
                },
                no: () => {
                    this.state.askToConfirm = null
                    callback && callback(false)
                    resolve(false)
                },
            }
        })
    }

    alert(message: string) {
        this.state.alert = message
    }
}

export default Store