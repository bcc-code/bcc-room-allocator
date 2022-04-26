import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'room-allocator',
	name: 'Room Allocator',
	icon: 'room_service',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
});