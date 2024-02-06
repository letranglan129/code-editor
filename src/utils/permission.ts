import { ObjectId } from 'mongodb';
import { PermissionProjectType } from './types'
import { FlattenMaps } from 'mongoose';

type PermissionProjectDBType = FlattenMaps<{
    uuid: ObjectId;
    permissionName: "editor" | "viewer" | "co-owner";
}>[]

export const isPermissionEdit = (permissions: PermissionProjectType[], userId: string) => {
    return !!permissions.find(
        per =>
            String(per.uuid._id) === userId &&
            (per.permissionName === 'editor' || per.permissionName === 'co-owner'),
    )
}
export const isPermissionCoOwner = (permissions: PermissionProjectType[], userId: string) => {
    return !!permissions.find(per => String(per.uuid._id) === userId && per.permissionName === 'co-owner')
}
export const isPermissionView = (permissions: PermissionProjectType[], userId: string) => {
    return !!permissions.find(per => String(per.uuid._id) === userId && per.permissionName === 'viewer')
}
export const isNonPermission = (permissions: PermissionProjectType[], userId: string) => {
    return !permissions.find(per => String(per.uuid._id) === userId)
}

export const isPermissionViewDB = (permissions: PermissionProjectDBType | undefined, userId: string) => {
    return !!(permissions || []).find(per => String(per.uuid._id) === userId && per.permissionName === 'viewer')
}
export const isPermissionEditDB = (permissions: PermissionProjectDBType | undefined, userId: string) => {
    return !!(permissions || []).find(
        per =>
            String(per.uuid) === userId &&
            (per.permissionName === 'editor' || per.permissionName === 'co-owner'),
    )
}
export const isPermissionCoOwnerDB = (permissions: PermissionProjectDBType | undefined, userId: string) => {
    return !!(permissions || []).find(per => String(per.uuid._id) === userId && per.permissionName === 'co-owner')
}