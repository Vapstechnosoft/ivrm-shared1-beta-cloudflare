'use server';
import { type ApiResponse, api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { StaffGatePassData, StaffGatePassInitialData } from '@/types/visitors-management/transactions';
import axios from 'axios';

async function getSessionContext() {
    try {
        const session = await auth();
        const mI_Id = Number(
            (session as any)?.mi_id ||
                (session as any)?.user?.mi_id ||
                (session as any)?.user?.mI_Id ||
                (session as any)?.mI_Id ||
                (session as any)?.user?.MI_Id ||
                (session as any)?.MI_Id ||
                30
        );
        const asmaY_Id = Number(
            (session as any)?.asmay_id ||
                (session as any)?.user?.asmay_id ||
                (session as any)?.user?.asmaY_Id ||
                (session as any)?.asmaY_Id ||
                (session as any)?.user?.ASMAY_Id ||
                (session as any)?.ASMAY_Id ||
                1
        );
        const userId = Number(
            (session as any)?.userId || (session as any)?.user?.userId || (session as any)?.user?.id || (session as any)?.id || 1
        );
        return { mI_Id, asmaY_Id, userId };
    } catch {
        return { mI_Id: 30, asmaY_Id: 1, userId: 1 };
    }
}

async function postVisitorsBackend(endpoint: string, payload: any) {
    try {
        const response = await api.post<any>('visitors', endpoint, payload);
        const data = (response as any)?.data || response;
        if (data && (data.emplist || data.employeelist || data.filldepartment || data.returnval !== undefined)) {
            return data;
        }
    } catch (e: any) {
        console.warn(`[StaffGatePass] apiService error for ${endpoint}, using direct local backend:`, e?.message);
    }

    const localUrl = `http://localhost:50198/api/${endpoint}`;
    const res = await axios.post(localUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
    });
    return res.data;
}

export async function getStaffGatePassData(): Promise<ApiResponse<StaffGatePassInitialData>> {
    try {
        const { mI_Id, asmaY_Id, userId } = await getSessionContext();
        let data = await postVisitorsBackend('StaffGatePassFacade/Getdetails', { mI_Id, asmaY_Id, userId });

        if (!data?.emplist || data.emplist.length === 0) {
            const fallbackData = await postVisitorsBackend('StaffGatePassFacade/Getdetails', { mI_Id: 30, asmaY_Id: 1, userId: 1 });
            if (fallbackData?.emplist && fallbackData.emplist.length > 0) {
                data = fallbackData;
            }
        }

        if (data) {
            const rawEmps = data.emplist || [];
            const emplist = rawEmps.map((e: any) => ({
                hrmE_Id: e.hrmE_Id || e.HRME_Id,
                empname:
                    e.empname ||
                    e.hrmE_EmployeeFirstName ||
                    e.hrmE_EmployeeCode ||
                    `${e.hrmE_EmployeeFirstName || ''} ${e.hrmE_EmployeeMiddleName || ''} ${e.hrmE_EmployeeLastName || ''}`.trim(),
                hrmD_Id: e.hrmD_Id || e.HRMD_Id,
                hrmdeS_Id: e.hrmdeS_Id || e.HRMDES_Id,
                hrmE_MobileNo: e.hrmE_MobileNo || e.hrmemnO_MobileNo || ''
            }));

            const filldepartment = data.filldepartment || [];
            const filldesignation = data.filldesignation || [];
            const alldata: StaffGatePassData[] = (data.alldata || []).map((row: any) => ({
                gphsT_Id: row.gphsT_Id || row.GPHST_Id,
                hrmE_Id: row.hrmE_Id || row.HRME_Id,
                empname: row.empname || row.hrmE_EmployeeFirstName || '',
                hrmD_DepartmentName: row.hrmD_DepartmentName || row.HRMD_DepartmentName || '',
                hrmdeS_DesignationName: row.hrmdeS_DesignationName || row.HRMDES_DesignationName || '',
                gphsT_GatePassNo: row.gphsT_GatePassNo || row.GPHST_GatePassNo || '',
                gphsT_DateTime: row.gphsT_DateTime || row.GPHST_DateTime || '',
                gphsT_OutTime: row.gphsT_OutTime || row.GPHST_OutTime || '',
                gphsT_InTime: row.gphsT_InTime || row.GPHST_InTime || '',
                gphsT_Remarks: row.gphsT_Remarks || row.GPHST_Remarks || '',
                gphsT_ActiveFlg: row.gphsT_ActiveFlg ?? row.GPHST_ActiveFlg ?? true,
                hrmD_Id: row.hrmD_Id || row.HRMD_Id,
                hrmdeS_Id: row.hrmdeS_Id || row.HRMDES_Id
            }));

            return {
                success: true,
                message: 'Data fetched successfully',
                data: {
                    emplist,
                    filldepartment,
                    filldesignation,
                    alldata
                }
            };
        }
    } catch (err: any) {
        console.error('StaffGatePassFacade/Getdetails error:', err?.message);
    }

    return {
        success: false,
        message: 'Failed to fetch staff gate pass data',
        data: {
            emplist: [],
            filldepartment: [],
            filldesignation: [],
            alldata: []
        }
    };
}

export async function saveStaffGatePass(formData: any): Promise<ApiResponse<any>> {
    try {
        const { mI_Id, asmaY_Id, userId } = await getSessionContext();
        const payload = {
            ...formData,
            mI_Id,
            asmaY_Id,
            userId
        };

        const data = await postVisitorsBackend('StaffGatePassFacade/saverecord', payload);

        if (data?.returnval === false || data?.dulicate === true) {
            return {
                success: false,
                message: data?.message || 'Record already exists or failed to save',
                data: null
            };
        }

        return {
            success: true,
            message: 'Gate Pass Generated Successfully!',
            data
        };
    } catch (err: any) {
        console.error('Save Staff Gate Pass Error:', err?.message);
        return {
            success: false,
            message: err?.message || 'Failed to save staff gate pass',
            data: null
        };
    }
}

export async function deactivateStaffGatePass(gphsT_Id: number): Promise<ApiResponse<any>> {
    try {
        const { mI_Id, asmaY_Id, userId } = await getSessionContext();
        const payload = {
            gphsT_Id,
            mI_Id,
            asmaY_Id,
            userId
        };

        const data = await postVisitorsBackend('StaffGatePassFacade/deactive', payload);

        return {
            success: true,
            message: 'Status Changed Successfully!',
            data
        };
    } catch (err: any) {
        return {
            success: false,
            message: err?.message || 'Failed to update status',
            data: null
        };
    }
}
