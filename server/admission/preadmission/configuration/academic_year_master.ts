'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterAcademicYearMasterList, IMasterSetOrderList } from '@/types/admission/preadmission/configaration';

export async function getPreAdmissionYear(searchParams?: ApiSearchparams) {
    const sortColumnMap: Record<string, string> = {
        asmaY_Id: 'ASMAY_Id',
        id: 'ASMAY_Id',
        asmaY_Year: 'ASMAY_Year',
        asmaY_From_Date: 'ASMAY_From_Date',
        asmaY_To_Date: 'ASMAY_To_Date',
        asmaY_Cut_Of_Date: 'ASMAY_Cut_Of_Date',
        asmaY_Order: 'ASMAY_Order',
        mI_Name: 'Institution_name',
        institution_name: 'Institution_name',
        Institution_name: 'Institution_name',
        asmaY_Pre_ActiveFlag: 'ASMAY_Pre_ActiveFlag'
    };

    const mappedSearchParams = searchParams
        ? {
              ...searchParams,
              sort_column: searchParams.sort_column
                  ? sortColumnMap[searchParams.sort_column] || searchParams.sort_column
                  : searchParams.sort_column
          }
        : {};

    const urlParams = getSearchParamsUrl(
        mappedSearchParams,
        'ASMAY_Year,ASMAY_AcademicYearCode,ASMAY_Order,ASMAY_From_Date,ASMAY_Cut_Of_Date,ASMAY_To_Date,Institution_name'
    );
    const url = `/configuration/academic_year?${urlParams}`;
    return await api.get<IMasterAcademicYearMasterList[]>('preadmission', url);
}

export async function getPreAdmissionYearEditData(id: number) {
    const url = `/configuration/editdata?ASMAY_Id=${id}`;
    return await api.post<any>('preadmission', url);
}

export async function getPreAdmissionSetOrder() {
    const url = '/configuration/academic_year_set_order_list';
    return await api.get<IMasterSetOrderList[]>('preadmission', url);
}

export async function addOrUpdatePreAdmissionYear(data: any) {
    const url = '/configuration/AddOrUpdateAcademicYear';
    return await api.post<any>('preadmission', url, data);
}
export async function togglePreAdmissionAcademicYear(id: number) {
    const url = `/configuration/academic_year/toggle/${id}`;
    return await api.put('preadmission', url);
}

export async function getInstitutionList() {
    const url = '/configuration/institution_list';
    return await api.get<{ mI_Id: number; mI_Name: string }[]>('preadmission', url);
}

export async function updateAcademicYearSetorder(data: any) {
    const url = '/configuration/academic_year/set_order';
    return await api.put<any>('preadmission', url, data);
}
