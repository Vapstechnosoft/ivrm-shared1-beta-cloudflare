'use server';

import { api } from '@/lib/apiService';
import type { IGroupTermMapping } from '@/types/student-portal/masters/fee_online_payment';

export interface AcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface StudentInfo {
    amst_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName: string;
    amsT_LastName: string;
    amsT_RegistrationNo: string;
    amsT_AdmNo: string;
    classname: string;
    sectionname: string;
    amst_email_id: string;
    asmcL_ID: number;
    amst_mobile: number;
    asmaY_Id: number;
    amaY_RollNo: string;
    amsT_PerCity?: string;
    amsT_Address?: string;
    mI_Id?: number;
    MI_Id?: number;
}

export interface FeeGroup {
    fmgG_Id: string;
    fmgG_GroupName: string;
    checkedgrplst: boolean;
    grpdisable: boolean;
}

export interface FeeTerm {
    fmT_Id: string;
    fmT_Name: string;
    fmgG_Id: string;
    checkedheadlst: boolean;
    termdisablechk: boolean;
}

export interface GroupTermMapping {
    grp: FeeGroup;
    trm_list: FeeTerm[];
}

export interface FeeStructure {
    fmH_FeeName: string;
    ftI_Name: string;
    fsS_OBArrearAmount: number;
    fsS_NetAmount: number;
    fsS_TotalToBePaid: number;
    fsS_ConcessionAmount: number;
    fsS_FineAmount: number;
    fsS_ToBePaid: number;
    isSelected: boolean;
}

export interface PaymentGateway {
    fpgD_PGName: string;
    fpgD_Image: string;
}

export interface PaymentOrderResponse {
    fyP_Receipt_No: string;
    fmA_Amount: number;
    merchantkey: string;
    trans_id: string;
    fillstudent: StudentInfo[];
    splitpayinformation: string;
    mI_Id: string;
    asmaY_Id: string;
    amst_Id: string;
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
    try {
        // /OnlinePayment/student-information
        const url = '/OnlinePayment/getalldetails';
        const response = await api.post<any>('portal', url, {});
        return response.data?.academicyrlist || [];
    } catch (error) {
        console.error('Error fetching academic years:', error);
        return [];
    }
}

export interface FeeSummaryDetails {
    charges: number;
    paid: number;
    outstanding: number;
    concession: number;
}

export async function getStudentInformation(
    academicYearId: number,
    feeConfig: any,
    amst_Id: number
): Promise<{
    studentInfo: StudentInfo | null;
    groupTermMappings: IGroupTermMapping[];
    feeConfig: any;
    filonlinepaymentgrid?: FeeStructure[];
    feeSummary?: FeeSummaryDetails;
    fillpaymentgateway?: any[];
    mI_Id?: number;
}> {
    try {
        const url = '/FeeOnlinePaymentFacade/getdetails';
        //const url = '/OnlinePayment/student-information';

        const response = await api.post<any>('fees', url, {
            configset: feeConfig,
            MI_Id: 0,
            ASMAY_Id: academicYearId,
            Amst_Id: amst_Id
        });

        if (!response.data) {
            throw new Error('Failed to fetch student information');
        }
        //console.log('Server Action received response:', JSON.stringify(response, null, 2));

        const grid: FeeStructure[] = response.data?.filonlinepaymentgrid || response.data?.fillstudentviewdetails || [];

        const charges =
            grid.length > 0
                ? grid.reduce((acc: number, curr: any) => acc + (Number(curr.fsS_NetAmount) || 0), 0)
                : Number(response.data?.fsS_NetAmount || 0);
        const paid =
            grid.length > 0
                ? grid.reduce((acc: number, curr: any) => acc + (Number(curr.fsS_PaidAmount) || 0), 0)
                : Number(response.data?.fsS_PaidAmount || 0);
        const outstanding =
            grid.length > 0
                ? grid.reduce((acc: number, curr: any) => acc + (Number(curr.fsS_ToBePaid) || 0), 0)
                : Number(response.data?.fsS_ToBePaid || 0);
        const concession =
            grid.length > 0
                ? grid.reduce((acc: number, curr: any) => acc + (Number(curr.fsS_ConcessionAmount) || 0), 0)
                : Number(response.data?.fsS_ConcessionAmount || 0);

        const termList = response.data?.termlist || response.data?.termlst || [];

        return {
            studentInfo: response.data?.fillstudent?.[0] || null,
            mI_Id:
                response.data?.mI_Id ||
                response.data?.MI_Id ||
                response.data?.fillstudent?.[0]?.mI_Id ||
                response.data?.fillstudent?.[0]?.MI_Id ||
                response.data?.institutiondet?.[0]?.mI_Id ||
                0,
            groupTermMappings:
                response.data?.customgrplist?.map((group: any) => ({
                    grp: {
                        fmgG_Id: group.fmgG_Id,
                        fmgG_GroupName: group.fmgG_GroupName,
                        checkedgrplst: false,
                        grpdisable: false
                    },
                    trm_list:
                        termList
                            ?.filter((term: any) => term.fmgG_Id === group.fmgG_Id)
                            ?.map((term: any) => ({
                                ...term,
                                fmT_Id: term.fmT_Id,
                                fmT_Name: term.fmT_Name,
                                fmgG_Id: term.fmgG_Id,
                                fmgG_GroupName: group.fmgG_GroupName,
                                fmT_Amount: term.fmT_Amount ?? term.payable ?? 0,
                                fmT_Order: term.fmT_Order ?? 0,
                                preAdmFlag: term.preAdmFlag ?? false,
                                checkedheadlst: false,
                                termdisablechk: term.payable ? Number(term.payable) <= Number(term.paid || 0) : false
                            })) || []
                })) || [],
            feeConfig: response.data?.readterms?.[0] || null,
            filonlinepaymentgrid: grid,
            fillpaymentgateway: response.data?.fillpaymentgateway || [],
            feeSummary: {
                charges,
                paid,
                outstanding,
                concession
            }
        };
    } catch (error) {
        console.error('Error fetching student information:', error);
        return {
            studentInfo: null,
            groupTermMappings: [],
            feeConfig: null,
            filonlinepaymentgrid: [],
            fillpaymentgateway: [],
            feeSummary: {
                charges: 0,
                paid: 0,
                outstanding: 0,
                concession: 0
            }
        };
    }
}

export async function getStudentPortalInformation() {
    try {
        //const url = '/OnlinePayment/getStudentportalInformation';
        const url = '/OnlinePayment/student-information';
        const response = await api.get<any>('portal', url, {});
        return response ?? { success: false, message: 'No data', data: null };
    } catch (error) {
        console.error('Error fetching student portal information:', error);
        return { success: false, message: 'Error fetching data', data: null };
    }
}

export async function getFeeDetails(
    selectedList: GroupTermMapping[],
    academicYearId: number,
    classId: number
): Promise<{
    feeStructures: FeeStructure[];
    paymentGateways: PaymentGateway[];
    totalRebate: number;
    feeConfig: any;
}> {
    try {
        const url = '/OnlinePayment/getamountdetails';
        const response = await api.post<any>('portal', url, {
            selected_list: selectedList,
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId
        });

        const feeStructures: FeeStructure[] =
            response.data?.fillstudentviewdetails?.map((item: any) => ({
                fmH_FeeName: item.fmH_FeeName,
                ftI_Name: item.ftI_Name,
                fsS_OBArrearAmount: item.fsS_OBArrearAmount || 0,
                fsS_NetAmount: item.fsS_NetAmount || 0,
                fsS_TotalToBePaid: item.fsS_TotalToBePaid || 0,
                fsS_ConcessionAmount: item.fsS_ConcessionAmount || 0,
                fsS_FineAmount: item.fsS_FineAmount || 0,
                fsS_ToBePaid: item.fsS_ToBePaid || 0,
                isSelected: true
            })) || [];

        const paymentGateways: PaymentGateway[] =
            response.data?.fillpaymentgateway?.map((pg: any) => ({
                fpgD_PGName: pg.fpgD_PGName,
                fpgD_Image: pg.fpgD_Image
            })) || [];

        return {
            feeStructures,
            paymentGateways,

            totalRebate: response.data?.fsS_RebateAmount || 0,
            feeConfig: response.data?.feeconfiglist?.[0] || null
        };
    } catch (error) {
        console.error('Error fetching fee details:', error);
        return {
            feeStructures: [],
            paymentGateways: [],
            totalRebate: 0,
            feeConfig: null
        };
    }
}

export async function generatePaymentOrder(
    feeStructures: FeeStructure[],
    totalAmount: number,
    studentInfo: StudentInfo,
    selectedList: GroupTermMapping[],
    paymentGateway: string,
    academicYearId: number,
    classId: number
): Promise<PaymentOrderResponse> {
    try {
        const url = '/OnlinePayment/generatehashsequence';

        const selectedFeeStructures = feeStructures.filter((fee) => fee.isSelected);

        const requestData = {
            temarray: selectedFeeStructures,
            topayamount: totalAmount,
            AMST_Id: studentInfo.amst_Id,
            ASMCL_Id: studentInfo.asmcL_ID,
            ASMAY_Id: academicYearId,
            selected_list: selectedList,
            onlinepaygteway: paymentGateway,
            FYP_PayModeType: 'Portal',
            selectedlist_partialpayment: feeStructures
        };

        const response = await api.post<any>('portal', url, requestData);

        return {
            fyP_Receipt_No: response.data?.fyP_Receipt_No || '',
            fmA_Amount: response.data?.fmA_Amount || 0,
            merchantkey: response.data?.merchantkey || '',
            trans_id: response.data?.trans_id || '',
            fillstudent: response.data?.fillstudent || [],
            splitpayinformation: response.data?.splitpayinformation || '',
            mI_Id: response.data?.mI_Id?.toString() || '',
            asmaY_Id: response.data?.asmaY_Id?.toString() || '',
            amst_Id: response.data?.amst_Id?.toString() || ''
        };
    } catch (error) {
        console.error('Error generating payment order:', error);
        throw new Error('Failed to generate payment order');
    }
}

export async function processRazorpayPayment(
    paymentData: PaymentOrderResponse,
    razorpayResponse: any
): Promise<{
    success: boolean;
    receiptNo?: string;
    message: string;
}> {
    try {
        const url = '/OnlinePayment/razorpaypaymentresponse';
        const response = await api.post<any>('portal', url, {
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            receiptNo: paymentData.fyP_Receipt_No,
            ...paymentData
        });

        return {
            success: response.data?.success || false,
            receiptNo: response.data?.receiptNo,
            message: response.data?.message || 'Payment processed successfully'
        };
    } catch (error) {
        console.error('Error processing Razorpay payment:', error);
        return {
            success: false,
            message: 'Failed to process payment'
        };
    }
}

export async function getPaymentCharges(): Promise<{
    payu: any;
    razorpay: any;
    paytm: any;
}> {
    try {
        const url = '/OnlinePayment/getgrouportermdetails';
        const response = await api.post<any>('portal', url, {});

        return {
            payu: response.data?.payu || {},
            razorpay: response.data?.razorpay || {},
            paytm: response.data?.paytm || {}
        };
    } catch (error) {
        console.error('Error fetching payment charges:', error);
        return {
            payu: {},
            razorpay: {},
            paytm: {}
        };
    }
}

// Added the student view details by Durga

export async function getStudentViewDetails() {
    try {
        const url = '/OnlinePayment/viewStudentAllDetails';
        const response = await api.get<any>('portal', url);
        return response.data;
    } catch (error) {
        console.error('Error fetching student view details:', error);
        throw new Error('Failed to fetch student view details');
    }
}
