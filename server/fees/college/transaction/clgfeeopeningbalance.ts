'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICollegeFeeOpeningBalanceAllDetailsResponse,
    ICollegeFeeOpeningBalanceGroup,
    ICollegeFeeOpeningBalanceHead,
    ICollegeFeeOpeningBalanceInstallment,
    ICollegeFeeOpeningBalanceSavePayload,
    ICollegeFeeOpeningBalanceStudent
} from '@/types/fees/college/transaction/clgfeeopeningbalance';
import { getCollegeBranches, getCollegeCourses, getCollegeSemesters } from './clgfeewaivedoff';

export { getCollegeCourses, getCollegeBranches, getCollegeSemesters };

export async function getCollegeFeeOpeningBalanceAllDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmaY_Year,amcsT_FirstName,fmG_GroupName,fmH_FeeName,ftI_Name');
    const url = `/CLGFeeOpeningBalanceFacade/getalldetails?${urlParams}`;
    return await api.get<ICollegeFeeOpeningBalanceAllDetailsResponse>('fees', url);
}

export async function getCollegeOpeningBalanceGroups(payload: {
    asmaY_Id: number;
    amcO_Id: number;
    amB_Id: number;
    amsE_Id: number;
}) {
    const url = '/CLGFeeOpeningBalanceFacade/get_groups';
    return await api.post<{ group?: ICollegeFeeOpeningBalanceGroup[]; grouplist?: ICollegeFeeOpeningBalanceGroup[] }>('fees', url, {
        asmaY_Id: payload.asmaY_Id,
        ASMAY_Id: payload.asmaY_Id,
        amcO_Id: payload.amcO_Id,
        AMCO_Id: payload.amcO_Id,
        amB_Id: payload.amB_Id,
        AMB_Id: payload.amB_Id,
        amsE_Id: payload.amsE_Id,
        AMSE_Id: payload.amsE_Id
    });
}

export async function getCollegeOpeningBalanceHeads(payload: {
    asmaY_Id: number;
    amcO_Id: number;
    amB_Id: number;
    amsE_Id: number;
    fmG_Id: number;
}) {
    const url = '/CLGFeeOpeningBalanceFacade/get_heads';
    return await api.post<{ headlist?: ICollegeFeeOpeningBalanceHead[] }>('fees', url, {
        fmG_Id: payload.fmG_Id,
        FMG_Id: payload.fmG_Id,
        asmaY_Id: payload.asmaY_Id,
        ASMAY_Id: payload.asmaY_Id,
        amcO_Id: payload.amcO_Id,
        AMCO_Id: payload.amcO_Id,
        amB_Id: payload.amB_Id,
        AMB_Id: payload.amB_Id,
        amsE_Id: payload.amsE_Id,
        AMSE_Id: payload.amsE_Id
    });
}

export async function getCollegeOpeningBalanceInstallments(payload: {
    asmaY_Id: number;
    amcO_Id: number;
    amB_Id: number;
    amsE_Id: number;
    fmG_Id: number;
    fmH_Id: number;
}) {
    const url = '/CLGFeeOpeningBalanceFacade/get_installments';
    return await api.post<{ installmentlist?: ICollegeFeeOpeningBalanceInstallment[] }>('fees', url, {
        asmaY_Id: payload.asmaY_Id,
        ASMAY_Id: payload.asmaY_Id,
        fmG_Id: payload.fmG_Id,
        FMG_Id: payload.fmG_Id,
        fmH_Id: payload.fmH_Id,
        FMH_Id: payload.fmH_Id,
        amcO_Id: payload.amcO_Id,
        AMCO_Id: payload.amcO_Id,
        amB_Id: payload.amB_Id,
        AMB_Id: payload.amB_Id,
        amsE_Id: payload.amsE_Id,
        AMSE_Id: payload.amsE_Id
    });
}

export async function getCollegeOpeningBalanceStudents(payload: {
    asmaY_Id: number;
    amcO_Id: number;
    amB_Id: number;
    amsE_Id: number;
    fmG_Id: number;
    fmH_Id: number;
    ftI_Id: number;
}) {
    const url = '/CLGFeeOpeningBalanceFacade/get_students';
    return await api.post<{
        studentlist?: ICollegeFeeOpeningBalanceStudent[];
        saveddata?: any[];
    }>('fees', url, {
        asmaY_Id: payload.asmaY_Id,
        ASMAY_Id: payload.asmaY_Id,
        amcO_Id: payload.amcO_Id,
        AMCO_Id: payload.amcO_Id,
        amB_Id: payload.amB_Id,
        AMB_Id: payload.amB_Id,
        amsE_Id: payload.amsE_Id,
        AMSE_Id: payload.amsE_Id,
        fmG_Id: payload.fmG_Id,
        FMG_Id: payload.fmG_Id,
        fmH_Id: payload.fmH_Id,
        FMH_Id: payload.fmH_Id,
        ftI_Id: payload.ftI_Id,
        FTI_Id: payload.ftI_Id
    });
}

export async function saveCollegeFeeOpeningBalance(data: ICollegeFeeOpeningBalanceSavePayload) {
    const url = '/CLGFeeOpeningBalanceFacade/savedata';
    return await api.post<any>('fees', url, data);
}

export async function deleteCollegeFeeOpeningBalance(fcmoB_Id: number) {
    const url = `/CLGFeeOpeningBalanceFacade/DeletRecord/${fcmoB_Id}`;
    return await api.delete<any>('fees', url);
}
