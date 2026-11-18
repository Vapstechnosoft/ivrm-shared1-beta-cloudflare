'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IPcRequisition } from '@/types/pettycash/transaction/pcREQUISITION';

export async function getPcRequisitionGrid(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'departmentname,employeename,pcreqtN_Date,pcreqtN_Purpose,pcreqtN_Id,pcreqtN_RequisitionNo,pcreqtN_CreatedDate'
    );
    const url = `/PC_RequisitionFacade/onloaddataTransactionGrid?${urlParams}`;
    const res = await api.get<IPcRequisition[]>('pettycashandassettracking', url);
    return res;
}

export async function GetDepartmentName(data: any) {
    const url = `/PC_RequisitionFacade/GetDepartments`;
    return await api.get<any>('pettycashandassettracking', url);
}
// GET/api/PC_RequisitionFacade/GetDepartments

export async function GetEmployeeName(hrmD_Id: number) {
    const url = `/PC_RequisitionFacade/onchangedept/${hrmD_Id}`;
    return await api.get<any>('pettycashandassettracking', url);
}

//toggle
export async function toggleRequisitionStatus(id: number) {
    const url = `/PC_RequisitionFacade/DeactivateParticularsRequisition/${id}`;
    return await api.put<any>('pettycashandassettracking', url);
}

//save
export async function saveRequisition(data: any) {
    const url = `/PC_RequisitionFacade/save_or_update_requisition_async`;
    console.log('data', data);
    return await api.post<any>('pettycashandassettracking', url, data);
}

//Particular drop down
export async function GetParticularData(data: any) {
    const url = `/PC_RequisitionFacade/GetParticulars`;
    return await api.get<any>('pettycashandassettracking', url, data);
}

//Edit button data
export async function GetEditButtonData(data: any) {
    const url = `/PC_RequisitionFacade/GetParticulars`;
    return await api.get<any>('pettycashandassettracking', url, data);
}

// View details
export async function getRequisitionViewData(PCREQTN_Id: number) {
    const url = `/PC_RequisitionFacade/Viewdata/${PCREQTN_Id}`;
    return await api.get<any>('pettycashandassettracking', url);
}

//document view
export async function getDocumentViewData(PCREQTN_Id: number) {
    const url = `/PC_RequisitionFacade/ViewDocuments/${PCREQTN_Id}`;
    return await api.get<any>('pettycashandassettracking', url);
}
// GET/api/PC_RequisitionFacade/ViewDocuments/{PCREQTN_Id}

//upload file button
export async function uploadDocument(data: any) {
    const url = `/document_upload/UploadDocument`;
    return await api.post<any>('pettycashandassettracking', url, data);
}
