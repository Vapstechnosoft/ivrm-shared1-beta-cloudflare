'use server';

import { api } from '@/lib/apiService';

// DCPS_TransferCertificate api/CollegeStudentTCReport/getalldetails
export async function getDanvantariTCLoadData() {
    return await api.get<any>('admission', '/CollegeStudentTCReport/getalldetails');
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/onchangeyear
export async function changeYearDanvantariTC(data: { ASMAY_Id: number; tctemporper: string }) {
    const url = `/CollegeStudentTCReport/onchangeyear?ASMAY_Id=${data.ASMAY_Id}&tctemporper=${data.tctemporper}`;
    return await api.post<any>('admission', url, {});
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/onchangecourse
export async function changeCourseDanvantariTC(data: { ASMAY_Id: number; AMCO_Id: number; tctemporper: string }) {
    const url = `/CollegeStudentTCReport/onchangecourse?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&tctemporper=${data.tctemporper}`;
    return await api.post<any>('admission', url, {});
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/onchangebranch
export async function changeBranchDanvantariTC(data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; tctemporper: string }) {
    const url = `/CollegeStudentTCReport/onchangebranch?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&tctemporper=${data.tctemporper}`;
    return await api.post<any>('admission', url, {});
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/onchangesemester
export async function changeSemesterDanvantariTC(data: {
    ASMAY_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    tctemporper: string;
}) {
    const url = `/CollegeStudentTCReport/onchangesemester?ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&tctemporper=${data.tctemporper}`;
    return await api.post<any>('admission', url, {});
}

// DCPS_TransferCertificate api/CollegeStudentTCReport/Getreportdetails
export async function getDanvantariTCDetails(data: {
    ASMAY_Id: number;
    AMCST_Id: number;
    AMCO_Id: number;
    AMB_Id: number;
    AMSE_Id: number;
    ACMS_Id: number;
    miId: number;
    admNo: string;
    studentName: string;
    tctemporper: string;
}) {
    try {
        const payload = {
            mI_Id: data.miId,
            mi_Id: data.miId,
            MI_Id: data.miId,
            asmaY_Id: data.ASMAY_Id,
            ASMAY_Id: data.ASMAY_Id,
            amcO_Id: data.AMCO_Id,
            AMCO_Id: data.AMCO_Id,
            amB_Id: data.AMB_Id,
            AMB_Id: data.AMB_Id,
            amsE_Id: data.AMSE_Id,
            AMSE_Id: data.AMSE_Id,
            acmS_Id: data.ACMS_Id,
            ACMS_Id: data.ACMS_Id,
            amcsT_Id: data.AMCST_Id,
            AMCST_Id: data.AMCST_Id,
            AMST_Id: data.AMCST_Id,
            amst_id: data.AMCST_Id,
            tctemporper: data.tctemporper,
            tcperortemp: data.tctemporper,
            allorindi: 'Individual',
            allorindid: '1',
            admnoorname: data.admNo,
            studentName: data.studentName
        };

        const url = `/CollegeStudentTCReport/Getreportdetails?TempararyArrayheadList=${encodeURIComponent(JSON.stringify(payload))}&ASMAY_Id=${data.ASMAY_Id}&AMCO_Id=${data.AMCO_Id}&AMB_Id=${data.AMB_Id}&AMSE_Id=${data.AMSE_Id}&ACMS_Id=${data.ACMS_Id}&AMCST_Id=${data.AMCST_Id}&AMCST_SOL=${data.tctemporper}&miId=${data.miId}&admNo=${encodeURIComponent(data.admNo)}&allorindid=1&allorindi=Individual`;

        console.info('📡 [DANVANTARI TC] Fetching:', url);
        const response = await api.get<any>('admission', url);
        return response;
    } catch (error: any) {
        console.error('💥 [DANVANTARI TC] Exception:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

export async function getDanvantariStudentName(data: {
    AMCO_Id: number;
    ASMAY_Id: number;
    AMB_Id: number;
    searchfilter: string;
    AMCST_SOL: string;
}) {
    const url = `/CollegeStudyCertificateReport/searchfilter?AMCO_Id=${data.AMCO_Id}&ASMAY_Id=${data.ASMAY_Id}&AMB_Id=${data.AMB_Id}&searchfilter=${data.searchfilter}&AMCST_SOL=${data.AMCST_SOL}`;
    return await api.post<any>('admission', url, {});
}
