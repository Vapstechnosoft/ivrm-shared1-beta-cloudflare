'use server';

import { api } from '@/lib/apiService';

export async function getInitialData(payload: any = { Organization: 0, Institute: 0 }) {
    const url = '/StudentApplication/getdpforreg';
    const res = await api.post<any>('preadmission', url, payload);
    return { success: true, data: res };
}

export async function saveAdmissionData(data: any) {
    const url = '/StudentApplication/savedata';
    const res = await api.post<any>('preadmission', url, data);
    return { success: true, message: 'Admission data saved successfully', data: res };
}

export async function payNow(data: any) {
    const url = '/StudentApplication/paynow';
    return await api.post<any>('preadmission', url, data);
}

export async function getClassChangeMaxMinAge(data: any) {
    const url = '/StudentApplication/classchangemaxminage';
    return await api.post<any>('preadmission', url, data);
}

export async function getClassOverUnderAge(data: any) {
    const url = '/StudentApplication/classoverunderage';
    return await api.post<any>('preadmission', url, data);
}

export async function getSubjectsOfInstitute(data: any) {
    const url = '/StudentApplication/GetSubjectsofinstitute';
    return await api.post<any>('preadmission', url, data);
}

export async function getStreams(data: any) {
    const url = '/StudentApplication/getstreams';
    return await api.post<any>('preadmission', url, data);
}

export async function fillProspectus(data: any) {
    const url = '/StudentApplication/fill_prospectus';
    return await api.post<any>('preadmission', url, data);
}

export async function classChange(data: any) {
    const url = '/StudentApplication/classchange';
    return await api.post<any>('preadmission', url, data);
}

export async function getCountOfStudents(data: any = { Organization: 0, Institute: 0 }) {
    const url = '/StudentApplication/Getcountofstudents';
    return await api.post<any>('preadmission', url, data);
}

export async function getApplicationHtml(data: any) {
    const url = '/StudentApplication/getapplicationhtml';
    return await api.post<any>('preadmission', url, data);
}

export async function getProspectusDetails(countryId: number) {
    const url = `/StudentApplication/getdprospectusdetails/${countryId}`;
    return await api.get<any>('preadmission', url);
}

export async function getDpState(countryId: number) {
    const url = `/StudentApplication/getdpstate/${countryId}`;
    return await api.get<any>('preadmission', url);
}

export async function getDpDistrict(stateId: number) {
    const url = `/StudentApplication/getdpdistrict/${stateId}`;
    return await api.get<any>('preadmission', url);
}

export async function getDpStateSubCatse(imcId: number) {
    const url = `/StudentApplication/getdpstatesubcatse/${imcId}`;
    return await api.get<any>('preadmission', url);
}

export async function getDpStateSubCatseFather(imcId: number) {
    const url = `/StudentApplication/getdpstatesubcatsefather/${imcId}`;
    return await api.get<any>('preadmission', url);
}

export async function getDpStateSubCatseMother(imcId: number) {
    const url = `/StudentApplication/getdpstatesubcatsemother/${imcId}`;
    return await api.get<any>('preadmission', url);
}

export async function deleteDetails(id: number) {
    const url = `/StudentApplication/deletedetails/${id}`;
    return await api.delete<any>('preadmission', url);
}

export async function activateDeactivate(data: any) {
    const url = '/StudentApplication/ActivateDactivate';
    return await api.post<any>('preadmission', url, data);
}

export async function searchData(data: any) {
    const url = '/StudentApplication/SearchData';
    return await api.post<any>('preadmission', url, data);
}

export async function getEditData(pasrId: number) {
    const url = `/StudentApplication/getEditData/${pasrId}`;
    return await api.get<any>('preadmission', url);
}
