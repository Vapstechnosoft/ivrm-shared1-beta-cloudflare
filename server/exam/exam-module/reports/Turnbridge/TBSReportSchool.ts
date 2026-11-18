'use server';

import { type ApiResponse, api } from '@/lib/apiService';

function cleanJson<T>(obj: T): T {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return obj;
    }
}

function hasDataItems(res: any): boolean {
    if (!res) return false;
    const checkArray = (arr: any) => {
        if (!arr) return false;
        if (Array.isArray(arr) && arr.length > 0) return true;
        if (arr.$values && Array.isArray(arr.$values) && arr.$values.length > 0) return true;
        return false;
    };
    if (checkArray(res)) return true;
    if (res.data && (checkArray(res.data) || checkArray(res.data.data))) return true;
    if (checkArray(res.academicyearlist)) return true;
    if (checkArray(res.yearlist)) return true;
    if (checkArray(res.classlist)) return true;
    if (checkArray(res.sectionlist)) return true;
    if (checkArray(res.examlist)) return true;
    if (checkArray(res.studentlist)) return true;
    if (checkArray(res.getstudentdetails)) return true;
    if (checkArray(res.studentdetails)) return true;
    if (checkArray(res.gradelist)) return true;
    if (typeof res === 'object' && Object.keys(res).length > 0) return true;
    return false;
}

export async function getTBSReportSchool(data: any): Promise<ApiResponse<any>> {
    try {
        const url = '/JSHSExamReports/promotion_report_TBSchool';

        // Format student list
        let temp_AmstIds: { amsT_Id: number }[] = [];
        if (Array.isArray(data.temp_Amstids)) {
            temp_AmstIds = data.temp_Amstids.map((item: any) => ({
                amsT_Id: Number(item.amsT_Id ?? item.AMST_Id ?? item)
            }));
        } else if (Array.isArray(data.Temp_AmstIds)) {
            temp_AmstIds = data.Temp_AmstIds.map((item: any) => ({
                amsT_Id: Number(item.amsT_Id ?? item.AMST_Id ?? item)
            }));
        } else if (Array.isArray(data.studentList)) {
            temp_AmstIds = data.studentList.map((item: any) => ({
                amsT_Id: Number(item.amsT_Id ?? item.AMST_Id ?? item)
            }));
        }

        // Format exam list
        let examlist: { emE_Id: number }[] = [];
        if (Array.isArray(data.examlist)) {
            examlist = data.examlist.map((item: any) => ({
                emE_Id: Number(item.emE_Id ?? item.EME_Id ?? item)
            }));
        } else if (Array.isArray(data.examList)) {
            examlist = data.examList.map((item: any) => ({
                emE_Id: Number(item.emE_Id ?? item.EME_Id ?? item)
            }));
        }

        const payload = {
            asmaY_Id: Number(data.asmaY_Id ?? data.ASMAY_Id ?? 0),
            asmcL_Id: Number(data.asmcL_Id ?? data.ASMCL_Id ?? 0),
            asmS_Id: Number(data.asmS_Id ?? data.ASMS_Id ?? 0),
            empsG_PercentValue: Number(data.empsG_PercentValue ?? 0),
            flag: String(data.flag ?? ''),
            emE_Id: Number(data.emE_Id ?? 0),
            reporttype: String(data.reporttype ?? 'REPORT'),
            temp_AmstIds,
            temp_Amstids: temp_AmstIds,
            empG_GroupName: String(data.empG_GroupName ?? ''),
            emgR_Id: Number(data.emgR_Id ?? 0),
            examlist,
            ecteX_NotApplToTotalFlg: Boolean(data.ecteX_NotApplToTotalFlg ?? true)
        };

        console.log('Sending payload to /JSHSExamReports/promotion_report_TBSchool:', payload);

        const response = await api.post<any>('exam', url, payload);

        console.log('RECEIVED BACKEND API RESPONSE:', response);

        if (hasDataItems(response)) return cleanJson(response);
        return cleanJson(response || {
            success: false,
            message: 'No records found',
            data: null
        });
    } catch (error) {
        console.error('getTBSReportSchool error:', error);
        return cleanJson({
            success: false,
            message: 'Error fetching report from API',
            data: null
        });
    }
}

