'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const FACADE = 'CirculationParameter';

// Helper to check if error is 405 Method Not Allowed
function is405Error(err: any): boolean {
    const message = err?.message || err?.toString() || '';
    const status = err?.status || err?.response?.status;
    return status === 405 || message.includes('405');
}

export const getCirculationParameterDetails = async () => {
    const url = `${FACADE}/culationtransaction-getdetails`;
    try {
        const res = await api.get<any>('library', url);
        if (res !== undefined && res !== null) return res;
    } catch {
        try {
            const res = await api.post<any>('library', url, {});
            if (res !== undefined && res !== null) return res;
        } catch (err: any) {
            console.warn('CirculationParameter/culationtransaction-getdetails error:', err?.message || err);
        }
    }
    return { success: false, message: 'Failed to load circulation parameter details' };
};

export const getCirculationData = async (payload?: any) => {
    const url = `${FACADE}/culationtransaction-getdetails`;
    try {
        return await api.post<any>('library', url, payload || {});
    } catch {
        try {
            return await api.get<any>('library', url, { params: payload });
        } catch (err: any) {
            console.error('Failed in getCirculationData:', err);
            throw err;
        }
    }
};

export const getCirculationParameterTypeChange = async (payload: {
    LMB_BookTypeflag: string;
    LMC_CategoryName?: string;
    MI_Id?: number;
}) => {
    const session = await auth();
    const miId = payload?.MI_Id || (session?.mi_id ? Number(session.mi_id) : 0);
    const body = {
        ...payload,
        MI_Id: miId,
        mI_Id: miId
    };

    try {
        return await api.post<any>('library', `${FACADE}/gettype`, body);
    } catch (err: any) {
        if (is405Error(err)) {
            try {
                return await api.get<any>('library', `${FACADE}/gettype`, { params: body });
            } catch {
                try {
                    return await api.post<any>('library', `${FACADE}/get_type`, body);
                } catch {
                    return await api.get<any>('library', `${FACADE}/get_type`, { params: body });
                }
            }
        }
        throw err;
    }
};

export const saveCirculationParameter = async (payload: any) => {
    const session = await auth();
    const miId = Number(payload?.mi_Id ?? payload?.MI_Id ?? payload?.mI_Id ?? (session?.mi_id ? Number(session.mi_id) : 1));
    const userId = Number(
        payload?.ivrmul_Id ??
        payload?.IVRMUL_Id ??
        payload?.ivrmuL_Id ??
        ((session as any)?.ivrmuL_Id
            ? Number((session as any).ivrmuL_Id)
            : (session as any)?.user_id
                ? Number((session as any).user_id)
                : session?.roleId
                    ? Number(session.roleId)
                    : 1)
    );

    const lbcpaId = Number(payload?.lbcpa_Id ?? payload?.lbcpA_Id ?? payload?.LBCPA_Id ?? payload?.circ_Id ?? 0);
    const asmclId = Number(payload?.asmcl_Id ?? payload?.asmcL_Id ?? payload?.ASMCL_Id ?? 0);
    const lmcId = Number(payload?.lmc_Id ?? payload?.lmC_Id ?? payload?.LMC_Id ?? 0);
    const hrmgtId = Number(payload?.hrmgt_Id ?? payload?.hrmgT_Id ?? payload?.HRMGT_Id ?? 0);
    const hrmdId = Number(payload?.hrmd_Id ?? payload?.hrmD_Id ?? payload?.HRMD_Id ?? 0);
    const guestId = Number(payload?.guest_Id ?? payload?.Guest_Id ?? 0);
    const maxItems = Number(payload?.max_Issue_Items ?? payload?.Max_Issue_Items ?? payload?.lbcpaS_NoOfItems ?? 0);
    const maxDays = Number(payload?.max_Issue_Days ?? payload?.Max_Issue_Days ?? payload?.lbcpaS_IssueDays ?? 0);
    const maxRenewals = Number(payload?.max_No_Renewals ?? payload?.Max_No_Renewals ?? payload?.lbcpaS_NoOfRenewals ?? 0);
    const issuer = String(payload?.issuertype1 ?? payload?.schclgflag ?? 'STUDENT').toUpperCase();
    const catgName = String(
        payload?.catgname ??
        payload?.bookType ??
        payload?.LMB_BookType ??
        payload?.lmB_BookType ??
        payload?.categoryName ??
        payload?.LMC_CategoryName ??
        'Issue'
    );
    const bookFlag = String(
        payload?.bookflag ?? payload?.LMB_BookTypeflag ?? payload?.lmB_BookTypeflag ?? payload?.BOOKFLAG ?? 'BP'
    ).toUpperCase();
    const excludeHoliday = payload?.lbcpa_ExcludeHolidayFlg !== undefined ? Boolean(payload.lbcpa_ExcludeHolidayFlg) : true;

    const requestPayload: any = {
        lbcpa_Id: lbcpaId,
        asmcl_Id: asmclId,
        lmc_Id: lmcId,
        hrmgt_Id: hrmgtId,
        max_Issue_Items: maxItems,
        max_Issue_Days: maxDays,
        max_No_Renewals: maxRenewals,
        issuertype1: issuer,
        catgname: catgName,
        bookflag: bookFlag,
        lbcpa_ExcludeHolidayFlg: excludeHoliday

    };

    if (hrmdId > 0 || issuer === 'DEPARTMENT') {
        requestPayload.hrmd_Id = hrmdId;
    }
    if (guestId > 0 || issuer === 'GUEST') {
        requestPayload.guest_Id = guestId;
    }

    try {
        return await api.post<{ returnval?: boolean; duplicate?: boolean; message?: string }>(
            'library',
            `${FACADE}/Savedata`,
            requestPayload
        );
    } catch (err: any) {
        if (is405Error(err)) {
            try {
                return await api.post<any>('library', `${FACADE}/savedata`, requestPayload);
            } catch {
                return await api.put<any>('library', `${FACADE}/Savedata`, requestPayload);
            }
        }
        throw err;
    }
};

export const toggleCirculationParameterStatus = async (payload: {
    lbcpa_Id?: number;
    LBCPA_Id?: number;
    LNBCPA_Id?: number;
    parmeter_Id?: number;
    Parmeter_Id?: number;
    bookflag?: string;
    BOOKFLAG?: string;
    issuertype1?: string;
    mi_SchoolCollegeFlag?: string;
    MI_SchoolCollegeFlag?: string;
    returnval?: boolean;
    MI_Id?: number;
    mI_Id?: number;
    [key: string]: any;
}) => {
    const session = await auth();
    const miId = payload?.MI_Id || payload?.mI_Id || (session?.mi_id ? Number(session.mi_id) : 0);

    const lbcpaId = Number(payload?.lbcpa_Id ?? payload?.LBCPA_Id ?? payload?.lbcpA_Id ?? payload?.lnbcpA_Id ?? payload?.LNBCPA_Id ?? 0);
    const parmeterId = Number(
        payload?.parmeter_Id ?? payload?.Parmeter_Id ?? payload?.param_Id ?? payload?.lbcpaS_Id ?? payload?.circ_Id ?? 0
    );
    const bookflag = String(payload?.bookflag || payload?.BOOKFLAG || payload?.lmB_BookTypeflag || 'BP');
    const issuertype1 = String(payload?.issuertype1 || payload?.schclgflag || 'STUDENT').toUpperCase();
    const miSchoolCollegeFlag = String(
        payload?.mi_SchoolCollegeFlag || payload?.MI_SchoolCollegeFlag || payload?.mI_SchoolCollegeFlag || 'S'
    );
    const returnval = payload?.returnval !== undefined ? Boolean(payload.returnval) : false;

    const requestPayload = {
        lbcpa_Id: lbcpaId,
        parmeter_Id: parmeterId,
        bookflag: bookflag,
        issuertype1: issuertype1,
        mi_SchoolCollegeFlag: miSchoolCollegeFlag,
        returnval: returnval,
        // Legacy uppercase aliases preserved for backwards compatibility
        LBCPA_Id: lbcpaId,
        Parmeter_Id: parmeterId,
        BOOKFLAG: bookflag,
        MI_SchoolCollegeFlag: miSchoolCollegeFlag,
        MI_Id: miId,
        mI_Id: miId
    };

    try {
        return await api.post<any>('library', `${FACADE}/Circulation-deactiveY`, requestPayload);
    } catch (err: any) {
        if (is405Error(err)) {
            try {
                return await api.put<any>('library', `${FACADE}/Circulation-deactiveY`, requestPayload);
            } catch {
                try {
                    return await api.post<any>('library', `${FACADE}/deactiveY`, requestPayload);
                } catch {
                    return await api.put<any>('library', `${FACADE}/deactiveY`, requestPayload);
                }
            }
        }
        throw err;
    }
};
