"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRoles = exports.importRoles = exports.exportPermissions = exports.importPermissions = exports.listConfiguredCollections = exports.getPermissionCollection = void 0;
const js_yaml_1 = require("js-yaml");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
const configPath = process.env.RBAC_CONFIG_PATH || './config';
const permissionsPath = path_1.default.resolve(configPath, 'permissions');
const rolesFile = path_1.default.join(path_1.default.resolve(configPath), `roles.yaml`);
//
// PERMISSIONS
//
async function getPermissionCollection(permissionId, permissionsService) {
    const permission = await permissionsService.readOne(permissionId, {
        fields: ['collection'],
    });
    return permission.collection;
}
exports.getPermissionCollection = getPermissionCollection;
async function listConfiguredCollections() {
    const allFiles = await fs_extra_1.default.readdir(permissionsPath);
    const collections = [];
    allFiles.forEach(file => {
        if (file.endsWith('.yaml')) {
            collections.push(file.replace('.yaml', ''));
        }
    });
    return collections;
}
exports.listConfiguredCollections = listConfiguredCollections;
async function importPermissions(collection, permissionsService) {
    const yamlFile = path_1.default.join(permissionsPath, `${collection}.yaml`);
    if (!fs_extra_1.default.pathExists(yamlFile)) {
        return 0;
    }
    const yamlInput = await fs_extra_1.default.readFile(yamlFile, 'utf8');
    const permissions = (0, js_yaml_1.load)(yamlInput);
    const permissionsToImport = [];
    const updatingActions = new Set();
    const updatingRoles = new Set();
    permissions.forEach((block) => {
        const { action, roles, permissions, validation, presets, fields } = block;
        if ((0, lodash_1.isEmpty)(roles)) {
            throw new Error(`Permission block ${collection}/${action} is missing roles`);
        }
        updatingActions.add(action);
        roles.forEach((role) => {
            updatingRoles.add(role);
            permissionsToImport.push({
                role,
                action,
                collection,
                permissions: permissions || null,
                validation: validation || null,
                presets: presets || null,
                fields: typeof fields === "string" ? [fields] : fields !== null && fields !== void 0 ? fields : null,
            });
        });
    });
    // Delete permissions not existing more on roles that we manage
    await permissionsService.deleteByQuery({
        filter: {
            collection,
            role: {
                _in: [...updatingRoles].map((role) => role === null ? permissionsService.knex.raw('NULL') : role),
            },
            action: {
                _nin: [...updatingActions],
            },
        }
    }, { emitEvents: false });
    const queue = permissionsToImport.map(async (permission) => {
        const { collection, action, role } = permission;
        const exists = await permissionsService.readByQuery({
            filter: {
                collection,
                action,
                role: role === null ? permissionsService.knex.raw('NULL') : role,
            },
            limit: 1,
            fields: ['id']
        }, { emitEvents: false });
        if (exists === null || exists === void 0 ? void 0 : exists.length) {
            await permissionsService.updateOne(exists[0].id, permission, { emitEvents: false });
        }
        else {
            await permissionsService.createOne(permission, { emitEvents: false });
        }
    });
    await Promise.all(queue);
}
exports.importPermissions = importPermissions;
async function exportPermissions(collection, permissionsService) {
    const rows = await permissionsService.readByQuery({
        filter: {
            collection,
        },
    });
    // Find matching permissions to group roles into
    const uniquePerms = [];
    rows.forEach(row => {
        const { role, action, permissions, validation, presets, fields } = row;
        const perm = {
            action
        };
        if (!(0, lodash_1.isEmpty)(permissions)) {
            perm.permissions = permissions;
        }
        if (!(0, lodash_1.isEmpty)(validation)) {
            perm.validation = validation;
        }
        if (!(0, lodash_1.isEmpty)(presets)) {
            perm.presets = presets;
        }
        if (Array.isArray(fields) && fields.length) {
            fields.sort((a, b) => a.localeCompare(b));
            perm.fields = fields.length === 1 ? fields[0] : fields;
        }
        const found = uniquePerms.find((unique) => (0, lodash_1.isEqual)(unique[0], perm));
        if (found) {
            if (!found[1].includes(role)) {
                found[1].push(role);
            }
        }
        else {
            uniquePerms.push([perm, [role]]);
        }
    });
    // Add the roles to each unique permission
    const permissions = uniquePerms.map(([perm, roles]) => {
        perm.roles = roles;
        return perm;
    });
    let yamlOutput = (0, js_yaml_1.dump)(permissions, {
        sortKeys: true,
    });
    const yamlFile = path_1.default.join(permissionsPath, `${collection}.yaml`);
    if (!yamlOutput.startsWith('[]')) {
        yamlOutput = yamlOutput.replaceAll('- action', '\n- action');
        await fs_extra_1.default.writeFile(yamlFile, yamlOutput, 'utf8');
    }
    else {
        await fs_extra_1.default.remove(yamlFile);
    }
}
exports.exportPermissions = exportPermissions;
//
// ROLES
//
async function importRoles(rolesService) {
    if (!fs_extra_1.default.pathExists(rolesFile)) {
        return 0;
    }
    const yamlInput = await fs_extra_1.default.readFile(rolesFile, 'utf8');
    const roles = (0, js_yaml_1.load)(yamlInput);
    const rolesToImport = roles.map((block) => {
        const { id, name, icon, description, enforce_2fa, external_id, ip_whitelist, app_access, admin_access } = block;
        return {
            id,
            name,
            icon: icon !== null && icon !== void 0 ? icon : 'supervised_user_circle',
            description: description !== null && description !== void 0 ? description : '',
            enforce_2fa: enforce_2fa !== null && enforce_2fa !== void 0 ? enforce_2fa : false,
            external_id: external_id !== null && external_id !== void 0 ? external_id : null,
            ip_whitelist: ip_whitelist !== null && ip_whitelist !== void 0 ? ip_whitelist : [],
            app_access: app_access !== null && app_access !== void 0 ? app_access : false,
            admin_access: admin_access !== null && admin_access !== void 0 ? admin_access : false,
        };
    });
    return await rolesService.upsertMany(rolesToImport, { emitEvents: false });
}
exports.importRoles = importRoles;
async function exportRoles(rolesService) {
    const rows = await rolesService.readByQuery({
        limit: -1,
        fields: ['id', 'name', 'icon', 'description', 'enforce_2fa', 'external_id', 'ip_whitelist', 'app_access', 'admin_access'],
    });
    const roles = rows.map((row) => {
        const { id, name, icon, ...optional } = row;
        const role = {
            id,
            name,
            icon,
        };
        // We only want to dump the optional fields if they are not falsy
        Object.entries(optional).forEach(([key, value]) => {
            if (!!value) {
                // @ts-ignore
                role[key] = value;
            }
        });
        return role;
    });
    let yamlOutput = (0, js_yaml_1.dump)(roles, {
        sortKeys: false,
    });
    if (!yamlOutput.startsWith('[]')) {
        yamlOutput = yamlOutput.replaceAll('- id', '\n- id');
        await fs_extra_1.default.writeFile(rolesFile, yamlOutput, 'utf8');
    }
    else {
        await fs_extra_1.default.remove(rolesFile);
    }
}
exports.exportRoles = exportRoles;
