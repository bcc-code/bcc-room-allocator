import { AbstractService } from './types';
export declare function getPermissionCollection(permissionId: string | number, permissionsService: AbstractService): Promise<string>;
export declare function listConfiguredCollections(): Promise<string[]>;
export declare function importPermissions(collection: string, permissionsService: AbstractService): Promise<0 | undefined>;
export declare function exportPermissions(collection: string, permissionsService: AbstractService): Promise<void>;
export declare function importRoles(rolesService: AbstractService): Promise<import("./types").PrimaryKey[] | 0>;
export declare function exportRoles(rolesService: AbstractService): Promise<void>;
