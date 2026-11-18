'use server';

import { api } from '@/lib/apiService';
import type {
    IPDAExpenditureImportLoadData,
    IPDAExpenditureSaveData,
    IPDAExpenditureSaveResponse
} from '@/types/pda/report/pda-expenditure-import';

export async function getPDAExpenditureImportLoadData() {
    const pageId = 2;
    const url = `FeeReceiptImportStthomas/getdetails/${pageId}`;
    return await api.get<IPDAExpenditureImportLoadData>('pettycashandassettracking', url);
}

export async function checkPDAExpenditureValidation(data: { newlstget1: any[] }) {
    const url = 'FeeReceiptImportStthomas/checkvalidation';
    return await api.post<IPDAExpenditureSaveResponse>('pettycashandassettracking', url, data);
}

export async function savePDAExpenditureImport(data: IPDAExpenditureSaveData) {
    const url = 'PDATransaction/pdaexpensesave';
    return await api.post<IPDAExpenditureSaveResponse>('pettycashandassettracking', url, data);
}
