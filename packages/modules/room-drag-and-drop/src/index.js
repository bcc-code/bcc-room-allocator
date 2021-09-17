import ModuleComponent from './module.vue';
import './compiled.css'

export default {
    id: 'room-allocator',
    name: 'Room Allocator',
    icon: 'room_service',
    routes: [
        {
            path: '',
            component: ModuleComponent,
        },
    ],
};