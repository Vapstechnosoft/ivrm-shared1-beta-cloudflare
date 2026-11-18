'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeAcademicYear,
    ICollegeFeeGroup,
    ICollegeFeeHead,
    ICollegeFeePrevilegeAllDetails,
    ICollegeFeeRole,
    ICollegeFeeUser
} from '@/types/fees/college/masters/masterclgfeeprevilege';

export async function getCollegeFeePrivilegeAcademicYears() {
    const url = '/CommonCollegeFee/getacademicyears';
    return await api.get<{ adcyear?: ICollegeAcademicYear[]; yearlist?: ICollegeAcademicYear[] } | ICollegeAcademicYear[]>('fees', url);
}

export async function getCollegeFeePrivilegeRoles() {
    const url = '/CommonCollegeFee/getroles';
    return await api.get<{ role?: ICollegeFeeRole[]; rolelist?: ICollegeFeeRole[]; roles?: ICollegeFeeRole[] } | ICollegeFeeRole[]>('fees', url);
}

export async function getCollegeFeePrivilegeFeeGroups() {
    const url = '/CommonCollegeFee/getfeegroups';
    return await api.get<{ group?: ICollegeFeeGroup[]; grouplist?: ICollegeFeeGroup[] } | ICollegeFeeGroup[]>('fees', url);
}

export async function getCollegeFeePrivilegeFeeHeads() {
    const url = '/CommonCollegeFee/getfeeheads';
    return await api.get<{ head?: ICollegeFeeHead[]; feeheads?: ICollegeFeeHead[] } | ICollegeFeeHead[]>('fees', url);
}

export async function getCollegeFeePrivilegeUsersByRole(roleId: number) {
    const url = `/MasterClgFeePrevilegeFacade/getusername?IVRMRT_Id=${roleId}`;
    return await api.get<{ usnam?: ICollegeFeeUser[]; userlist?: ICollegeFeeUser[] } | ICollegeFeeUser[]>('fees', url);
}

export async function getCollegeFeePrivilegeList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'NormalizedUserName,FMG_GroupName,FMH_FeeName,IVRMRT_Role');
    const url = `/MasterClgFeePrevilegeFacade/getpagedetails?${urlParams}`;
    return await api.get<ICollegeFeePrevilegeAllDetails>('fees', url);
}

export async function getCollegeFeePrivilegeEdit(fglId: number) {
    const url = `/MasterClgFeePrevilegeFacade/edit/${fglId}`;
    return await api.get<any>('fees', url);
}

export async function saveCollegeFeePrivilege(data: any) {
    const url = '/MasterClgFeePrevilegeFacade/savedetail';
    return await api.post<any>('fees', url, data);
}

export async function deleteCollegeFeePrivilege(fglId: number) {
    const url = `/MasterClgFeePrevilegeFacade/delete/${fglId}`;
    return await api.delete<any>('fees', url);
}
