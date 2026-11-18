'use server';

import { api } from '@/lib/apiService';

export interface StudentTcDTO {
    amsT_Id: number;
    studentName: string;
    amsT_AdmNo: string;
}

// --- TC Apply Actions ---

export const getStudentsByAcademicYear = async (asmayId: number): Promise<any> => {
    return api.post('admission', `/StudentTc/getstudenttcdata?ASMAY_Id=${asmayId}`, {});
};

export const getStudentTCDetails = async (amstId: number, asmayId: number, statusFlag: string, feetobepaid = 0): Promise<any> => {
    return api.post(
        'admission',
        `/StudentTc/gettcDetails?AMST_Id=${amstId}&ASMAY_Id=${asmayId}&Status_flag=${statusFlag}&feetobepaid=${feetobepaid}`,
        {}
    );
};

export const saveStudentTC = async (data: any): Promise<any> => {
    return api.post('admission', '/StudentTC/savedetails', data);
};

export const getStudentDetailsOnNameChange = async (asmayId: number, amstId: number): Promise<any> => {
    return api.post('admission', `/StudentTc/OnStudentNameChange?AMST_Id=${amstId}&ASMAY_Id=${asmayId}`, {});
};

export const getTCCancelDetails = async (asmayId: number, amstId: number, reason?: string): Promise<any> => {
    let url = `/StudentTc/GetTCCancelDetails?AMST_Id=${amstId}&ASMAY_Id=${asmayId}`;
    if (reason) {
        url += `&TC_CancelReason=${encodeURIComponent(reason)}`;
    }
    return api.post('admission', url, {});
};

// --- TC Cancel Actions ---

export const getTCCancelInitialData = async (asmayId?: number): Promise<any> => {
    let url = '/StudentTc/GetTCCancelDetails';
    if (asmayId) {
        url += `?ASMAY_Id=${asmayId}`;
    }
    return api.post('admission', url, {});
};

export const onChangeAcademicYearForCancel = async (asmayId: number): Promise<any> => {
    return api.post('admission', `/StudentTc/OnChangeAcademicYear?ASMAY_Id=${asmayId}`, {});
};

export const onStudentNameChangeForCancel = async (asmayId: number, amstId: number): Promise<any> => {
    return api.post('admission', `/StudentTc/OnStudentNameChange?AMST_Id=${amstId}&ASMAY_Id=${asmayId}`, {});
};

export const saveTCCancelDetails = async (data: any): Promise<any> => {
    return api.post(
        'admission',
        `/StudentTc/SaveTCCancelDetails?AMST_Id=${data.AMST_Id}&ASMAY_Id=${data.ASMAY_Id}&TC_CancelReason=${encodeURIComponent(data.TC_CancelReason)}`,
        {}
    );
};

export const checkTCDuplication = async (asmayId: number, tcNo: string): Promise<any> => {
    return api.post('admission', `/StudentTc/chk_tc_dup?ASMAY_Id=${asmayId}&ASTC_TCNO=${tcNo}`, {});
};

export const getStudentNameList = async (asmayId: number, amstId = 0, flag = 'S'): Promise<any> => {
    return api.post('admission', `/StudentTc/getstudent_name_list?AMST_Id=${amstId}&ASMAY_Id=${asmayId}&adm_num_flag=${flag}`, {});
};

export const searchStudentFilter = async (asmayId: number, amstSol: string, searchfilter: string, flag: string): Promise<any> => {
    return api.post(
        'admission',
        `/StudentTc/searchfilter?ASMAY_Id=${asmayId}&AMST_SOL=${amstSol}&searchfilter=${encodeURIComponent(searchfilter)}&flag=${flag}`,
        {}
    );
};
