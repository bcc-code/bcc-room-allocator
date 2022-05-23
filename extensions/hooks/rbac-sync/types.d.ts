import type { Knex } from 'knex';
import type { Accountability, Filter, PermissionsAction } from '@directus/shared/src/types';
export declare type StoredPermission = {
    action: PermissionsAction;
    roles?: Array<string | null>;
    permissions?: Filter | null;
    validation?: Filter | null;
    presets?: Record<string, any> | null;
    fields?: Array<string> | string | null;
};
export declare type StoredRole = {
    id: string;
    name: string;
    icon: string;
    description?: string;
    enforce_2fa?: boolean;
    external_id?: string;
    ip_whitelist?: string[];
    app_access?: boolean;
    admin_access?: boolean;
};
export declare type Item = Record<string, any>;
export declare type PrimaryKey = string | number;
export declare type MutationOptions = {
    emitEvents?: boolean;
};
export interface AbstractService {
    knex: Knex;
    accountability: Accountability | null;
    createOne(data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey>;
    createMany(data: Partial<Item>[], opts?: MutationOptions): Promise<PrimaryKey[]>;
    readOne(key: PrimaryKey, query?: any, opts?: MutationOptions): Promise<Item>;
    readMany(keys: PrimaryKey[], query?: any, opts?: MutationOptions): Promise<Item[]>;
    readByQuery(query: any, opts?: MutationOptions): Promise<Item[]>;
    updateOne(key: PrimaryKey, data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey>;
    updateMany(keys: PrimaryKey[], data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey[]>;
    upsertMany(payloads: Partial<Item>[], opts?: MutationOptions): Promise<PrimaryKey[]>;
    deleteOne(key: PrimaryKey, opts?: MutationOptions): Promise<PrimaryKey>;
    deleteMany(keys: PrimaryKey[], opts?: MutationOptions): Promise<PrimaryKey[]>;
    deleteByQuery(query: any, opts?: MutationOptions): Promise<PrimaryKey[]>;
}
