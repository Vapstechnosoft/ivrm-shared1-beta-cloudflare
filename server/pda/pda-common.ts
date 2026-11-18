'use server';

import { api } from '@/lib/apiService';

const serviceName = 'pettycashandassettracking';

export async function getAcademicYearData() {
    const url = '/PDACommonFacade/GetAcademicYearData';
    return await api.get<any>(serviceName, url);
}

export async function getClassDetails(asmayId?: number) {
    const url = `/PDACommonFacade/GetClassDetails${asmayId ? `?ASMAY_Id=${asmayId}` : ''}`;
    return await api.get<any>(serviceName, url);
}

export async function getSectionDetails(asmayId?: number, asmclId?: number) {
    const url = `/PDACommonFacade/GetSectionDetails${asmayId && asmclId ? `?ASMAY_Id=${asmayId}&ASMCL_Id=${asmclId}` : ''}`;
    return await api.get<any>(serviceName, url);
}

export async function getCategoryDetails() {
    const url = '/PDACommonFacade/GetCategoryDetails';
    return await api.get<any>(serviceName, url);
}

export async function getStudentDetails(asmayId?: number, asmclId?: number, asmsId?: number) {
    const url = `/PDACommonFacade/GetStudentDetails${asmayId && asmclId && asmsId ? `?ASMAY_Id=${asmayId}&ASMCL_Id=${asmclId}&ASMS_Id=${asmsId}` : ''}`;
    return await api.get<any>(serviceName, url);
}
