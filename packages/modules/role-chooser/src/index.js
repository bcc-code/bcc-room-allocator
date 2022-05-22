import ModuleComponent from './module.vue';

export default {
	id: 'role-chooser',
	name: 'Role Chooser',
	icon: 'security',
	routes: [
		{
			path: '',
			component: ModuleComponent,
		},
	],
	preRegisterCheck(user, permissions) {
		if (user.role.admin_access) return true;

		const permission = permissions.find(
			(permission) => permission.collection === 'directus_users' && permission.action === 'update' && permission.fields.includes('role')
		);

		return !!permission;
	},
};