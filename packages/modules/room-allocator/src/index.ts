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
	preRegisterCheck(user, permissions) {
		if (user.role.admin_access) return true;

		const permission = permissions.find(
			(permission) => permission.collection === 'registrations' && permission.action === 'update'
		);

		return !!permission;
	},
});