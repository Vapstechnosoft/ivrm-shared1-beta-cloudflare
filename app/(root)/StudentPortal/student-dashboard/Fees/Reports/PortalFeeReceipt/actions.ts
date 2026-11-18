'use server';

import { api } from '@/lib/apiService';

export async function getPortalFeeReceiptLoadData() {
    const url = '/fee_class_category/academicyearlist';
    const yearlist = await api.getArray<any>('fees', url);

    return {
        yearlist: yearlist.data || []
    };
}

export async function getReceipts(yearId: number) {
    const url = `/FeesCtrl/get-Receipt-Drop/${yearId}`;

    try {
        const response = await api.get<any>('portal', url);
        console.log('Response from get-Receipt-Drop:', response);

        let receiptsArray = [];

        // Handle different response structures
        if (response?.data && Array.isArray(response.data)) {
            receiptsArray = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
            receiptsArray = response.data.data;
        } else if (response?.data?.recnolist && Array.isArray(response.data.recnolist)) {
            receiptsArray = response.data.recnolist;
        } else if (response && Array.isArray(response)) {
            receiptsArray = response;
        }

        return {
            recnolist: receiptsArray
        };
    } catch (error) {
        console.error('Error in getReceipts:', error);
        return { recnolist: [] };
    }
}

export async function getReceiptDetails(yearId: number, fypId: number) {
    const url = `/FeesCtrl/print-Receipt-details`;

    try {
        const requestBody = {
            asmaY_Id: yearId,
            fyP_Id: fypId
        };
        const response = await api.post<any>('portal', url, requestBody);
        console.log('Response from print-Receipt-details:', response);

        let data = response?.data;

        // If data is wrapped in a generic standard response { success, data }
        if (data && typeof data === 'object' && 'success' in data && data.data) {
            data = data.data;
        }

        // Normalize data for frontend if the new API response structure is used
        if (data) {
            data.fillstudentviewdetails = data.studentDetailsData ?? data.fillstudentviewdetails ?? [];
            data.currpaymentdetails = data.currentpaymentdetails ?? data.currpaymentdetails ?? [];
            data.filltotaldetails = data.filltotaldetails ?? [];
        }

        return data || null;
    } catch (error) {
        console.error('Error in getReceiptDetails:', error);
        return null;
    }
}
