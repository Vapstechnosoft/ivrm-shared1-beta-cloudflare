'use server';

import { api } from '@/lib/apiService';
import type { HostelFoodConveyanceReportValues } from '@/schemas/hostel/reports/hostel-food-conveyance-report.schema';

export interface HFCReportLoadDataResponse {
    allAcademicYear: any[];
    allClass: any[];
    allSection: any[];
}

export interface HFCReportStudent {
    regno?: string;
    admno?: string;
    stuFN: string;
    stuMN?: string;
    stuLN?: string;
    class?: string;
    section?: string;
    namme?: string;
    [key: string]: any;
}

export interface HFCReportResponse {
    studentlist: HFCReportStudent[];
}

export async function getHFCReportLoadData(_pageId = 0): Promise<HFCReportLoadDataResponse | null> {
    try {
        const response = await api.get<any>('admission', '/HostelFoodConveyanceReport/getloaddata');
        const raw = response?.data ?? response;
        return {
            allAcademicYear: raw?.allAcademicYear || raw?.academicYearList || raw?.yearList || [],
            allClass: raw?.allClass || raw?.classList || [],
            allSection: raw?.allSection || raw?.sectionList || []
        };
    } catch (error) {
        console.error('Error fetching HFC report load data:', error);
        return null;
    }
}

export async function getHFCReport(data: HostelFoodConveyanceReportValues): Promise<HFCReportResponse | null> {
    try {
        const asmsId = data.asmC_Id;
        const url = `/HostelFoodConveyanceReport/getStudData?HFC_Flag=${data.hfcFlag}&ASMAY_Id=${data.asmaY_Id}&ASMCL_Id=${data.asmcL_Id}&ASMS_Id=${asmsId}`;
        const response = await api.post<any>('admission', url, {
            HFC_Flag: data.hfcFlag,
            ASMAY_Id: data.asmaY_Id,
            ASMCL_Id: data.asmcL_Id,
            ASMS_Id: asmsId,
            ASMC_Id: asmsId
        });
        const result = response?.data ?? response;
        return {
            studentlist: result?.studentlist || []
        };
    } catch (error) {
        console.error('Error fetching HFC report data:', error);
        return null;
    }
}
