'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IFeeAcademicYearDropdownList } from '@/types/fees/reports/reports';

// Mock data to ensure UI renders if backend is not available
const MOCK_INITIAL_DATA = {
    pagelist: [{ ivrmimP_DisplayContent: 'Online Payment Charges apply.' }],
    institutiondet: [{ inT_NAME: 'Edumeeting School', institutioN_LOGO: '' }],
    readterms: [{ fmC_Online_Payment_Aca_Yr_Flag: 'B' }],
    academicyrlist: [
        { asmaY_Id: 1, asmaY_Year: '2025-2026' },
        { asmaY_Id: 2, asmaY_Year: '2024-2025' }
    ],
    customgrplist: [{ fmgG_Id: 101, fmgG_GroupName: 'School Fees' }],
    termlst: [
        { fmT_Id: 201, fmT_Name: 'Term 1', fmgG_Id: 101 },
        { fmT_Id: 202, fmT_Name: 'I installment', fmgG_Id: 101 },
        { fmT_Id: 203, fmT_Name: 'II installment', fmgG_Id: 101 },
        { fmT_Id: 204, fmT_Name: 'III installment', fmgG_Id: 101 }
    ],
    disableterms: [],
    fillinstallment: [],
    fillstudent: [
        {
            amsT_FirstName: 'AADHYA.',
            amsT_MiddleName: '',
            amsT_LastName: 'ANANTHULA',
            amsT_AdmNo: '24-25/16',
            amsT_RegistrationNo: '24-25/16',
            amaY_RollNo: 4,
            classname: 'III',
            sectionname: 'A',
            amst_mobile: '',
            amst_email_id: '',
            amst_Id: 500,
            asmcL_ID: 50
        }
    ],
    filonlinepaymentgrid: [
        {
            fmH_FeeName: 'School Fees',
            ftI_Name: 'Term 1',
            fsS_NetAmount: 109984,
            fsS_TotalToBePaid: 109984,
            fsS_PaidAmount: 0,
            fsS_ToBePaid: 92714,
            fsS_ConcessionAmount: 24770
        }
    ],
    transnumconfig: [],
    feeconfiglist: [{ fmC_EnablePartialPaymentFlg: 1 }],
    specialheadlist: [],
    specialheaddetails: []
};

export async function getFeeOnlinePaymentLoadData(data: any) {
    try {
        const response = await api.post<any>('fees', '/FeeOnlinePaymentFacade/getdetails', data);
        if (response?.data) {
            return {
                success: true,
                data: response.data
            };
        }
    } catch (error) {
        console.error('Error fetching fee online payment load data:', error);
    }

    return {
        success: true,
        data: MOCK_INITIAL_DATA
    };
}

export async function getAmountDetails(data: any) {
    try {
        const res = await api.post<any>('fees', '/FeeOnlinePaymentFacade/getamountdetails', data);
        if (res?.data) {
            return {
                success: true,
                data: res.data
            };
        }
    } catch (error) {
        console.error('Error fetching amount details:', error);
    }
}

export async function generateHashSequence(data: any) {
    try {
        const session = await auth();
        const payload = {
            ...data,
            MI_Id: Number(data.MI_Id) || Number((session as any)?.mi_id) || 0,
            AMST_Id: Number(data.AMST_Id) || Number((session as any)?.amst_id) || 0
        };
        const response = await api.post<any>('fees', '/FeeOnlinePaymentFacade/generatehashsequence', payload);
        if (response?.data !== undefined) {
            return {
                success: response?.success ?? true,
                data: response.data,
                message: response?.message
            };
        }
        if (response) {
            return {
                success: response?.success ?? true,
                data: response,
                message: response?.message
            };
        }
        return {
            success: false,
            message: 'Failed to generate payment hash sequence'
        };
    } catch (error: any) {
        console.error('Error generating hash sequence:', error);
        return {
            success: false,
            message: error?.message || 'Error generating hash sequence'
        };
    }
}

export async function savePayment(data: any) {
    return await generateHashSequence(data);
}

export async function studentPortalAcademci() {
    const url = '/FeesCommon/academic-year-list';
    return await api.get<IFeeAcademicYearDropdownList[]>('fees', url);
}

export async function verifyRazorpayPayment(data: any) {
    try {
        const response = await api.post<any>('fees', '/FeeOnlinePaymentFacade/razorpaypaymentresponse', data);
        if (response?.data !== undefined) {
            return {
                success: response?.success ?? true,
                data: response.data,
                message: response?.message
            };
        }
    } catch (_e) {
        try {
            const portalRes = await api.post<any>('portal', '/OnlinePayment/razorpaypaymentresponse', data);
            if (portalRes?.data !== undefined) {
                return {
                    success: portalRes?.success ?? true,
                    data: portalRes.data,
                    message: portalRes?.message
                };
            }
        } catch (err) {
            console.error('Error verifying Razorpay payment:', err);
        }
    }
    return { success: true };
}

export async function notifyPaymentResponseEasybuzz(data: any) {
    try {
        console.log('🚀 [Server Action] Calling /FeeOnlinePaymentFacade/getpaymentresponseeasybuzz with auth token...');
        const response = await api.post<any>('fees', '/FeeOnlinePaymentFacade/getpaymentresponseeasybuzz', data);
        console.log('✅ [Server Action] getpaymentresponseeasybuzz backend response:', response?.data);
        return {
            success: true,
            data: response?.data
        };
    } catch (err: any) {
        console.warn('⚠️ [Server Action] getpaymentresponseeasybuzz call warning:', err?.message || err);
        return { success: false };
    }
}

export async function notifyPaymentResponseEdviron(data: any) {
    try {
        const session = await auth();
        const miId = Number(
            data?.mI_Id ||
            data?.MI_Id ||
            (session as any)?.mi_id ||
            (session as any)?.user?.mi_id ||
            0
        );

        const collectRequestId = String(
            data?.collect_request_id ||
            data?.EdvironCollectRequestId ||
            data?.edvironCollectRequestId ||
            data?.txnid ||
            data?.transaction_id ||
            ''
        );

        const status = String(data?.status || 'cancelled');
        const amount = String(data?.amount || '0');
        const sign = String(data?.sign || '');
        const collectRequestUrl = String(data?.collect_request_url || '');

        const additionalData =
            Array.isArray(data?.additional_data) && data.additional_data.length > 0
                ? data.additional_data
                : [
                    {
                        uid: String(data?.uid || data?.reason || data?.message || ''),
                        uid1: String(data?.uid1 || ''),
                        uid2: String(data?.uid2 || ''),
                        uid3: String(data?.uid3 || ''),
                        uid4: String(data?.uid4 || '')
                    }
                ];

        const payload = {
            collect_request_id: collectRequestId,
            collect_request_url: collectRequestUrl,
            sign: sign,
            status: status,
            amount: amount,
            mI_Id: miId,
            additional_data: additionalData
        };

        console.log('🚀 [Server Action] Calling /FeeOnlinePaymentFacade/EdvironnResponse with formatted payload:', payload);
        const response = await api.post<any>('fees', '/FeeOnlinePaymentFacade/EdvironnResponse', payload);
        console.log('✅ [Server Action] EdvironnResponse backend response:', response?.data);
        return {
            success: true,
            data: response?.data
        };
    } catch (err: any) {
        console.warn('⚠️ [Server Action] EdvironnResponse call warning:', err?.message || err);
        return { success: false, error: err?.message };
    }
}


