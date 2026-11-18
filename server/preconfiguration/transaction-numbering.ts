'use server';

import { api } from '@/lib/apiService';
import type { IMasterTransactionNumberingList } from '@/types/admission/preadmission/configaration';

export async function getRegistrationNumbering() {
    const url = '/TransactionNumbering/getdetails';
    return await api.get<IMasterTransactionNumberingList[]>('preadmission', url);
}

export async function getRegNumbering(numberingType: string) {
    const url = `/TransactionNumbering/getdetails`;
    return await api.get<any>('preadmission', url);
}

export async function getPreRegistrationNumbering() {
    const url = '/TransactionNumbering/getdetails/PreRegistration';
    return await api.get<IMasterTransactionNumberingList[]>('preadmission', url);
}

export async function getMasterNumbering() {
    const url = '/TransactionNumbering/getdetails/Master';
    return await api.get<IMasterTransactionNumberingList[]>('preadmission', url);
}

export async function addOrUpdateTransactionNumbering(data: any) {
    const url = '/TransactionNumbering/saveMaster_Numbering';
    return await api.post<any>('preadmission', url, data);
}

export async function deleteRollnoconfig(ivrmarncId: number) {
    const url = `/TransactionNumbering/deleteRollnoconfig?IVRMARNC_Id=${ivrmarncId}`;
    return await api.delete<any>('preadmission', url);
}
