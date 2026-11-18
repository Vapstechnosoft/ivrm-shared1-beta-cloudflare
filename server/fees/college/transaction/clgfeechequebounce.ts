'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeFeeChequeBounceAllDetailsResponse,
    ICollegeFeeChequeBounceReceipt,
    ICollegeFeeChequeBounceSavePayload
} from '@/types/fees/college/transaction/clgfeechequebounce';
import { getCollegeBranches, getCollegeCourses, getCollegeSemesters, getCollegeStudents } from './clgfeewaivedoff';

export { getCollegeCourses, getCollegeBranches, getCollegeSemesters, getCollegeStudents };

export async function getCollegeFeeChequeBounceAllDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmaY_Year,amcsT_FirstName,fyP_ReceiptNo,fccB_Amount,fccB_Date');
    const url = `/CLGFeeChequeBounceFacade/getalldetails?${urlParams}`;
    return await api.get<ICollegeFeeChequeBounceAllDetailsResponse>('fees', url);
}

export async function getCollegeFeeChequeBounceReceipts(payload: {
    asmaY_Id: number;
    amcsT_Id: number;
}) {
    const url = '/CLGFeeChequeBounceFacade/get_receipts';
    return await api.post<{ receiptlist?: ICollegeFeeChequeBounceReceipt[] }>('fees', url, {
        asmaY_Id: payload.asmaY_Id,
        amcsT_Id: payload.amcsT_Id
    });
}

export async function saveCollegeFeeChequeBounce(data: ICollegeFeeChequeBounceSavePayload) {
    const url = '/CLGFeeChequeBounce/savedata';
    return await api.post<any>('fees', url, data);
}

export async function deleteCollegeFeeChequeBounce(fccB_Id: number) {
    const url = `/CLGFeeChequeBounce/DeletRecord/${fccB_Id}`;
    return await api.delete<any>('fees', url);
}
