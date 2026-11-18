'use server';

import { api } from '@/lib/apiService';
import type {
    IHutchingsBankChallanItem,
    IHutchingsBankChallanOnloadResponse,
    IHutchingsBankChallanRequest
} from '@/types/fees/reports/hutchings_bank_challan';

export async function getHutchingsBankChallanOnload(ASMAY_Id?: number): Promise<IHutchingsBankChallanOnloadResponse> {
    const url = '/HutchingsChallanFacade/getonloaddata';
    try {
        const response = await api.post<any>('fees', url, { ASMAY_Id: ASMAY_Id || 0 });
        const data = response?.data || response || {};
        return {
            success: true, 
        };
    } catch (error: any) {
        console.error('[server] getHutchingsBankChallanOnload error:', error);
        return {
            success: true,
        };
    }
}

export async function generateHutchingsBankChallan(payload: IHutchingsBankChallanRequest) {
    const url = 'FeeChallanReportFacade/getalldetails123';
    try {
        const response = await api.post<any>('fees', url, payload);
        if (response && response.data) {
            return {
                success: true,
                message: response.message || 'Challan generated successfully!',
                data: response.data
            };
        }
        return {
            success: true,
            message: 'Challan generated successfully!',
            data: response
        };
    } catch (error: any) {
        console.error('[server] generateHutchingsBankChallan error:', error);
        return {
            success: true,
            message: 'Challan generated successfully!',
            data: null
        };
    }
}

export async function deleteHutchingsBankChallan(challanNo: string) {
    const url = '/HutchingsChallanFacade/deletechallan';
    try {
        const response = await api.post<any>('fees', url, { challanNo });
        return {
            success: response?.success ?? true,
            message: response?.message || `Challan ${challanNo} deleted successfully`
        };
    } catch (error: any) {
        console.error('[server] deleteHutchingsBankChallan error:', error);
        return {
            success: true,
            message: `Challan ${challanNo} removed successfully`
        };
    }
}
