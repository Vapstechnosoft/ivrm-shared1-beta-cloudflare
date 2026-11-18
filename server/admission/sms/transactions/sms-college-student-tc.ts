'use server';

import { api } from '@/lib/apiService';
import type {
    ISMSCollegeStudentTCInitialData,
    ISMSCollegeStudentTCResponse,
    ISMSCollegeStudentTCStudent
} from '@/types/admission/sms/transactions/sms-college-student-tc';

const BASE_URL = 'CollegeStudenttctransaction';

export async function getInitialData() {
    return await api.get<ISMSCollegeStudentTCInitialData>('admission', `/${BASE_URL}/loaddata/4`);
}

export async function onYearChange(asmaY_Id: number) {
    return await api.post<any>('admission', `/${BASE_URL}/onchangeyear`, { ASMAY_Id: asmaY_Id });
}

export async function onCourseChange(asmaY_Id: number, amcO_Id: number) {
    return await api.post<any>('admission', `/${BASE_URL}/onchangecourse`, { ASMAY_Id: asmaY_Id, AMCO_Id: amcO_Id });
}

export async function onBranchChange(asmaY_Id: number, amcO_Id: number, amB_Id: number) {
    return await api.post<any>('admission', `/${BASE_URL}/onchangebranch`, {
        ASMAY_Id: asmaY_Id,
        AMCO_Id: amcO_Id,
        AMB_Id: amB_Id
    });
}

export async function onSemesterChange(asmaY_Id: number, amcO_Id: number, amB_Id: number, amsE_Id: number) {
    return await api.post<any>('admission', `/${BASE_URL}/onchangesemester`, {
        ASMAY_Id: asmaY_Id,
        AMCO_Id: amcO_Id,
        AMB_Id: amB_Id,
        AMSE_Id: amsE_Id
    });
}

export async function onSectionChange(asmaY_Id: number, amcO_Id: number, amB_Id: number, amsE_Id: number, acmS_Id: number) {
    return await api.post<any>('admission', `/${BASE_URL}/onchangesection`, {
        ASMAY_Id: asmaY_Id,
        AMCO_Id: amcO_Id,
        AMB_Id: amB_Id,
        AMSE_Id: amsE_Id,
        ACMS_Id: acmS_Id
    });
}

export async function searchFilter(data: any) {
    return await api.post<ISMSCollegeStudentTCStudent[]>('admission', `/${BASE_URL}/searchfilter`, data);
}

export async function onStudentChange(data: any) {
    return await api.post<ISMSCollegeStudentTCResponse>('admission', `/${BASE_URL}/onchangestudent`, data);
}

export async function checkDuplicateTC(tcNo: string) {
    return await api.post<any>('admission', `/${BASE_URL}/chk_dup_tc`, { ACSTC_TCNO: tcNo });
}

export async function saveTC(data: any) {
    return await api.post<any>('admission', `/${BASE_URL}/savetc`, data);
}
