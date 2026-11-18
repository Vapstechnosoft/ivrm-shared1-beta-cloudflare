'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentPortalAcademic } from '@/hooks/fees/useReports';
import { useStudentInformation } from '@/hooks/staff-portal/useFeeOnlinePayment';
import type { FeeStructure, IGroupTermMapping } from '@/types/student-portal/masters/fee_online_payment';
import { AlertCircle, Calendar, Check, CheckCircle2, Copy, FileText, Hash, Loader2, Printer, Receipt, User, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    generateHashSequence,
    getAmountDetails,
    notifyPaymentResponseEasybuzz,
    notifyPaymentResponseEdviron,
    verifyRazorpayPayment
} from '../actions';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface PaymentModalState {
    isOpen: boolean;
    status: 'success' | 'cancelled' | 'failed';
    transactionId?: string;
    receiptNo?: string;
    amount?: number | string;
    date?: string;
    message?: string;
    gateway?: string;
    studentName?: string;
    admNo?: string;
}

export default function FeeOnlinePaymentClient() {
    const searchParams = useSearchParams();
    const { data: response, isLoading: isAcademicLoading } = useStudentPortalAcademic();
    const [academicYear, setAcademicYear] = useState<number | undefined>();
    const [groupTermList, setGroupTermList] = useState<IGroupTermMapping[]>([]);
    const [feeDetails, setFeeDetails] = useState<FeeStructure[]>([]);
    const [paymentGateWay, setPaymentGateWay] = useState<any[]>([]);
    const [totalAmt, setTotalAmt] = useState(0);
    const [rebate, setRebate] = useState(0);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [gateway, setGateway] = useState<string>('');
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [isRazorpayReady, setIsRazorpayReady] = useState(false);
    const [mI_Id, setMI_Id] = useState<number>(0);
    const [copiedTxn, setCopiedTxn] = useState(false);
    const hasProcessedPaymentRef = useRef(false);

    // Payment Result Popup State
    const [paymentModalState, setPaymentModalState] = useState<PaymentModalState>({
        isOpen: false,
        status: 'success'
    });

    const handleOkAndRefresh = () => {
        setPaymentModalState((prev) => ({ ...prev, isOpen: false }));
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pending_fee_payment');
            window.location.href = '/StudentPortal/masters/feeonlinpayment';
        }
    };

    // Set academic year when response loads
    useEffect(() => {
        if (response?.data?.[0]?.asmaY_Id) {
            setAcademicYear(response.data[0].asmaY_Id);
        }
    }, [response]);

    const {
        data: studentInfoDetails,
        isLoading: isStudentLoading,
        isFetching: isStudentFetching,
        refetchAll
    } = useStudentInformation(academicYear || null, 'T', 0);

    const isStudentDataLoading = (isStudentLoading || isStudentFetching) && !!academicYear;

    const toArray = (val: any): any[] => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (val?.$values && Array.isArray(val.$values)) return val.$values;
        return [];
    };

    // Detect return from external payment gateway (via URL query parameters)
    useEffect(() => {
        if (hasProcessedPaymentRef.current) return;

        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

        const rawStatus = (
            searchParams?.get('status') ||
            urlParams?.get('status') ||
            searchParams?.get('payment_status') ||
            urlParams?.get('payment_status') ||
            searchParams?.get('paymentStatus') ||
            urlParams?.get('paymentStatus') ||
            searchParams?.get('pay_status') ||
            urlParams?.get('pay_status') ||
            ''
        ).toLowerCase();

        const edvironCollectRequestId =
            searchParams?.get('EdvironCollectRequestId') ||
            urlParams?.get('EdvironCollectRequestId') ||
            searchParams?.get('edvironCollectRequestId') ||
            urlParams?.get('edvironCollectRequestId') ||
            searchParams?.get('collect_request_id') ||
            urlParams?.get('collect_request_id') ||
            searchParams?.get('collectRequestId') ||
            urlParams?.get('collectRequestId') ||
            searchParams?.get('requestId') ||
            urlParams?.get('requestId') ||
            '';

        const txnid =
            searchParams?.get('txnid') ||
            urlParams?.get('txnid') ||
            searchParams?.get('transaction_id') ||
            urlParams?.get('transaction_id') ||
            searchParams?.get('trans_id') ||
            urlParams?.get('trans_id') ||
            searchParams?.get('easepayid') ||
            urlParams?.get('easepayid') ||
            searchParams?.get('payment_id') ||
            urlParams?.get('payment_id') ||
            edvironCollectRequestId ||
            '';

        const receiptno =
            searchParams?.get('receiptno') ||
            urlParams?.get('receiptno') ||
            searchParams?.get('receipt_no') ||
            urlParams?.get('receipt_no') ||
            searchParams?.get('fyP_Receipt_No') ||
            urlParams?.get('fyP_Receipt_No') ||
            searchParams?.get('fyp_receipt_no') ||
            urlParams?.get('fyp_receipt_no') ||
            '';

        const rawAmount =
            searchParams?.get('amount') ||
            urlParams?.get('amount') ||
            searchParams?.get('topayamount') ||
            urlParams?.get('topayamount') ||
            searchParams?.get('total_amount') ||
            urlParams?.get('total_amount') ||
            '';

        const msg =
            searchParams?.get('msg') ||
            urlParams?.get('msg') ||
            searchParams?.get('message') ||
            urlParams?.get('message') ||
            searchParams?.get('reason') ||
            urlParams?.get('reason') ||
            searchParams?.get('error_Message') ||
            urlParams?.get('error_Message') ||
            searchParams?.get('error') ||
            urlParams?.get('error') ||
            '';

        let storedInfo: any = null;
        if (typeof window !== 'undefined') {
            try {
                const item = sessionStorage.getItem('pending_fee_payment');
                if (item) storedInfo = JSON.parse(item);
            } catch (e) {
                console.error('Error reading stored payment info:', e);
            }
        }

        let storedEdviron: any = null;
        if (typeof window !== 'undefined') {
            try {
                const item = sessionStorage.getItem('edviron_callback_data');
                if (item) storedEdviron = JSON.parse(item);
            } catch (e) {
                console.error('Error reading stored edviron info:', e);
            }
        }

        let storedEasebuzz: any = null;
        if (typeof window !== 'undefined') {
            try {
                const item = sessionStorage.getItem('easebuzz_callback_data');
                if (item) storedEasebuzz = JSON.parse(item);
            } catch (e) {
                console.error('Error reading stored easebuzz info:', e);
            }
        }

        const gwParam = (searchParams?.get('gateway') || urlParams?.get('gateway') || '').toUpperCase();

        const isEdviron =
            !!edvironCollectRequestId ||
            txnid.toLowerCase().includes('edviron') ||
            gwParam.includes('EDVIRON') ||
            String(storedInfo?.gateway || gateway || '')
                .trim()
                .toUpperCase()
                .includes('EDVIRON') ||
            !!storedEdviron;

        const isEasebuzz =
            txnid.toLowerCase().includes('easebuzz') ||
            !!searchParams?.get('easepayid') ||
            !!urlParams?.get('easepayid') ||
            gwParam.includes('EASEBUZZ') ||
            String(storedInfo?.gateway || gateway || '')
                .trim()
                .toUpperCase()
                .includes('EASEBUZZ') ||
            !!storedEasebuzz;

        const isSuccess = ['success', 'successful', 'succeeded', 'ok', 'captured', '1', 'true', 'paid', 'completed'].includes(rawStatus);

        const isCancelled =
            [
                'cancel',
                'cancelled',
                'canceled',
                'usercancelled',
                'user_cancelled',
                'user-cancelled',
                'user_cancel',
                'payment_cancelled',
                'cancelled_by_user',
                'abort',
                'aborted',
                'dropped-by-user',
                'dropped_by_user'
            ].includes(rawStatus) ||
            (!isSuccess &&
                (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('abort') || msg.toLowerCase().includes('dropped')));

        const isFailure = ['fail', 'failed', 'failure', 'declined', 'error', '0', 'false'].includes(rawStatus);

        const hasGatewayResponse =
            isSuccess ||
            isCancelled ||
            isFailure ||
            (rawStatus && rawStatus !== '') ||
            !!edvironCollectRequestId ||
            !!searchParams?.get('easepayid') ||
            !!urlParams?.get('easepayid') ||
            !!storedEdviron ||
            !!storedEasebuzz;

        if (hasGatewayResponse) {
            hasProcessedPaymentRef.current = true;
            const finalStatus: 'success' | 'cancelled' | 'failed' = isSuccess
                ? 'success'
                : isCancelled || (isEdviron && !isFailure)
                  ? 'cancelled'
                  : 'failed';

            // Retrieve full Edviron callback payload
            if (isEdviron) {
                let edvironPayload: Record<string, any> = storedEdviron || {};
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('edviron_callback_data');
                }

                if (Object.keys(edvironPayload).length === 0 && urlParams) {
                    edvironPayload = Object.fromEntries(urlParams.entries());
                }

                if (!edvironPayload.status) edvironPayload.status = rawStatus || (finalStatus === 'success' ? 'success' : 'cancelled');
                if (!edvironPayload.EdvironCollectRequestId && edvironCollectRequestId) {
                    edvironPayload.EdvironCollectRequestId = edvironCollectRequestId;
                }
                if (!edvironPayload.txnid && txnid) edvironPayload.txnid = txnid;
                const formattedEdvironPayload = {
                    collect_request_id: String(
                        edvironPayload.collect_request_id ||
                            edvironPayload.EdvironCollectRequestId ||
                            edvironPayload.edvironCollectRequestId ||
                            edvironCollectRequestId ||
                            txnid ||
                            ''
                    ),
                    collect_request_url: String(edvironPayload.collect_request_url || ''),
                    sign: String(edvironPayload.sign || ''),
                    status: String(edvironPayload.status || rawStatus || (finalStatus === 'success' ? 'success' : 'cancelled')),
                    amount: String(edvironPayload.amount || rawAmount || storedInfo?.amount || totalAmt || '0'),
                    mI_Id: Number(
                        storedInfo?.mI_Id || mI_Id || (studentInfoDetails as any)?.mI_Id || (studentInfoDetails as any)?.MI_Id || 0
                    ),
                    additional_data: [
                        {
                            uid: String(edvironPayload.reason || msg || (finalStatus === 'cancelled' ? 'dropped-by-user' : '')),
                            uid1: '',
                            uid2: '',
                            uid3: '',
                            uid4: ''
                        }
                    ]
                };

                // Notify backend for Edviron using student's authenticated session
                notifyPaymentResponseEdviron(formattedEdvironPayload).then((res) => {
                    if (res?.data) {
                        const newReceipt = res.data.fyP_Receipt_No || res.data.receiptno || res.data.fyp_receipt_no || res.data.receipt_no;
                        if (newReceipt) {
                            setPaymentModalState((prev) => ({
                                ...prev,
                                receiptNo: newReceipt
                            }));
                        }
                    }
                });
            }

            // Retrieve full Easebuzz callback payload
            if (isEasebuzz) {
                let easebuzzPayload: Record<string, any> = storedEasebuzz || {};
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('easebuzz_callback_data');
                }

                if (Object.keys(easebuzzPayload).length === 0 && urlParams) {
                    easebuzzPayload = Object.fromEntries(urlParams.entries());
                }

                if (!easebuzzPayload.status) easebuzzPayload.status = rawStatus;
                if (!easebuzzPayload.txnid && txnid) easebuzzPayload.txnid = txnid;
                if (!easebuzzPayload.amount && rawAmount) easebuzzPayload.amount = rawAmount;
                if (!easebuzzPayload.easepayid && (searchParams?.get('easepayid') || urlParams?.get('easepayid'))) {
                    easebuzzPayload.easepayid = searchParams?.get('easepayid') || urlParams?.get('easepayid');
                }

                // If transaction is from Easebuzz, notify backend using the student's authenticated session
                notifyPaymentResponseEasybuzz(easebuzzPayload).then((res) => {
                    if (res?.data) {
                        const newReceipt = res.data.fyP_Receipt_No || res.data.receiptno || res.data.fyp_receipt_no || res.data.receipt_no;
                        if (newReceipt) {
                            setPaymentModalState((prev) => ({
                                ...prev,
                                receiptNo: newReceipt
                            }));
                        }
                    }
                });
            }

            const rawStudent = studentInfoDetails?.studentInfo;
            const student = Array.isArray(rawStudent) ? rawStudent[0] : rawStudent;
            const studentName =
                storedInfo?.studentName || (student ? `${student.amsT_FirstName || ''} ${student.amsT_LastName || ''}`.trim() : '');
            const admNo = storedInfo?.admNo || student?.amsT_AdmNo || student?.amsT_RegistrationNo || '';
            const amount = Number(rawAmount) || storedInfo?.amount || totalAmt || 0;
            const gw = isEdviron ? 'EDVIRON' : isEasebuzz ? 'EASEBUZZ' : storedInfo?.gateway || gateway || 'Payment Gateway';

            const cancellationMessage = isEdviron
                ? 'You cancelled the Edviron payment. No payment confirmation was received. You can try again.'
                : 'Payment was cancelled. No money was debited from your account.';

            const successMessage = isEdviron
                ? 'Your online fee payment via Edviron was completed successfully.'
                : 'Your fee payment has been successfully processed.';

            setPaymentModalState({
                isOpen: true,
                status: finalStatus,
                transactionId: txnid || edvironCollectRequestId,
                receiptNo: receiptno,
                amount,
                date: new Date().toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                gateway: gw,
                studentName,
                admNo,
                message:
                    msg ||
                    (finalStatus === 'success'
                        ? successMessage
                        : finalStatus === 'cancelled'
                          ? cancellationMessage
                          : 'Payment could not be processed. Please try again.')
            });

            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('pending_fee_payment');
            }

            if (finalStatus === 'success') {
                refetchAll();
            }
        }
    }, [searchParams, studentInfoDetails, totalAmt, gateway, refetchAll]);

    // Populate group-term list and initial payment gateways when studentInfoDetails loads
    useEffect(() => {
        const mappings = toArray(studentInfoDetails?.groupTermMappings);
        if (mappings.length > 0 && groupTermList.length === 0) {
            setGroupTermList(mappings);
        }
        const gateways = toArray(studentInfoDetails?.fillpaymentgateway);
        if (gateways.length > 0 && paymentGateWay.length === 0) {
            setPaymentGateWay(gateways);
            const firstGw = gateways[0]?.fpgD_PGName || gateways[0]?.FPGD_PGName || gateways[0]?.paymentgateway || 'RAZORPAY';
            setGateway(firstGw);
        }
        const detectedMiId =
            (studentInfoDetails as any)?.mI_Id ||
            (studentInfoDetails as any)?.MI_Id ||
            (studentInfoDetails?.studentInfo as any)?.mI_Id ||
            (studentInfoDetails?.studentInfo as any)?.MI_Id ||
            0;
        if (detectedMiId && mI_Id === 0) {
            setMI_Id(Number(detectedMiId));
        }
    }, [studentInfoDetails, groupTermList.length, paymentGateWay.length, mI_Id]);

    // Calculate Fee Summary figures based on studentInfoDetails
    const feeGrid = toArray(studentInfoDetails?.filonlinepaymentgrid);

    const charges =
        studentInfoDetails?.feeSummary?.charges ||
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item?.fsS_NetAmount) || 0), 0) : 0);

    const paid =
        studentInfoDetails?.feeSummary?.paid ??
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item?.fsS_PaidAmount) || 0), 0) : 0);

    const outstanding =
        studentInfoDetails?.feeSummary?.outstanding ||
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item?.fsS_ToBePaid) || 0), 0) : 0);

    const concession =
        studentInfoDetails?.feeSummary?.concession ||
        (feeGrid.length > 0 ? feeGrid.reduce((sum: number, item: any) => sum + (Number(item?.fsS_ConcessionAmount) || 0), 0) : 0);

    const formatCurrency = (val: number) => `₹ ${Number(val || 0).toLocaleString('en-IN')}`;

    const handleGroupCheck = (grpIndex: number, checked: boolean) => {
        const newList = [...groupTermList];
        newList[grpIndex].grp.checkedgrplst = checked;
        newList[grpIndex].trm_list.forEach((trm) => {
            if (typeof trm === 'object' && !trm.termdisablechk) {
                trm.checkedheadlst = checked;
            }
        });
        setGroupTermList(newList);
    };

    const handleTermCheck = (grpIndex: number, trmIndex: number, checked: boolean) => {
        const newList = [...groupTermList];
        if (typeof newList[grpIndex].trm_list[trmIndex] === 'object') {
            newList[grpIndex].trm_list[trmIndex].checkedheadlst = checked;
        }

        const someTermsChecked = newList[grpIndex].trm_list.some((t) => t.checkedheadlst);

        if (someTermsChecked) {
            newList[grpIndex].grp.checkedgrplst = true;
        } else {
            newList[grpIndex].grp.checkedgrplst = false;
        }

        setGroupTermList(newList);
    };

    const handleShowDetails = async () => {
        const selectedList = groupTermList
            .filter((g) => g.grp.checkedgrplst)
            .map((g) => ({
                grp: g.grp,
                trm_list: g.trm_list.filter((t) => t.checkedheadlst)
            }));

        if (selectedList.length === 0 || selectedList.some((g) => g.trm_list.length === 0)) {
            toast.warning('Please select at least one Group and Term');
            return;
        }

        try {
            setIsDetailsLoading(true);
            const result = await getAmountDetails({
                MI_Id: mI_Id || 0,
                configset: 'T',
                ASMAY_Id: academicYear,
                AMST_Id: studentInfoDetails?.studentInfo?.amst_Id || 0,
                ASMCL_Id: studentInfoDetails?.studentInfo?.asmcL_ID,
                selected_list: selectedList
            });
            if (result?.success && result?.data) {
                if (result.data.mI_Id || result.data.MI_Id) {
                    setMI_Id(Number(result.data.mI_Id || result.data.MI_Id));
                }
                setFeeDetails(result.data.fillstudentviewdetails || []);
                const gateways = result.data.fillpaymentgateway || [];
                setPaymentGateWay(gateways);
                if (gateways.length > 0) {
                    const firstGw = gateways[0].fpgD_PGName || gateways[0].FPGD_PGName || gateways[0].paymentgateway || 'RAZORPAY';
                    setGateway(firstGw);
                } else {
                    setGateway('RAZORPAY');
                }
                setShowPaymentDetails(true);
                const total = (result.data.fillstudentviewdetails || []).reduce(
                    (acc: number, curr: any) => acc + (curr.fsS_ToBePaid || 0),
                    0
                );
                const totalRebate = result.data.fsS_RebateAmount || 0;
                setTotalAmt(total);
                setRebate(totalRebate);
            }
        } catch (error) {
            console.error('Error fetching amount details:', error);
            toast.error('Failed to load fee details');
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!gateway) {
            toast.warning('Please select a payment gateway');
            return;
        }

        if (totalAmt <= 0) {
            toast.warning('Total payable amount must be greater than 0');
            return;
        }

        const gatewayUpper = String(gateway).trim().toUpperCase();
        if (gatewayUpper === 'RAZORPAY' && (!isRazorpayReady || typeof window.Razorpay !== 'function')) {
            toast.error('Razorpay is still loading. Please try again in a moment.');
            return;
        }

        const selected_list = groupTermList
            .filter((g) => g.grp.checkedgrplst)
            .map((g) => ({
                grp: {
                    fmgG_GroupName: g.grp.fmgG_GroupName,
                    fmgG_Id: Number(g.grp.fmgG_Id) || g.grp.fmgG_Id,
                    checkedgrplst: g.grp.checkedgrplst
                },
                trm_list: g.trm_list
                    .filter((t) => t.checkedheadlst)
                    .map((t) => ({
                        checkedheadlst: t.checkedheadlst,
                        fmT_Amount: t.fmT_Amount ?? 0,
                        fmT_Id: Number(t.fmT_Id) || t.fmT_Id,
                        fmT_Name: t.fmT_Name,
                        fmT_Order: t.fmT_Order ?? 0,
                        fmgG_GroupName: t.fmgG_GroupName || g.grp.fmgG_GroupName,
                        fmgG_Id: Number(t.fmgG_Id || g.grp.fmgG_Id) || t.fmgG_Id || g.grp.fmgG_Id,
                        preAdmFlag: t.preAdmFlag ?? false,
                        termdisablechk: t.termdisablechk ?? false
                    }))
            }));

        const mappedFeeItems = feeDetails.map((item: any) => ({
            ...item,
            fmA_Id: Number(item.fmA_Id ?? item.fma_id ?? item.FMA_Id ?? 0),
            fmH_Id: Number(item.fmH_Id ?? item.fmh_id ?? item.FMH_Id ?? 0),
            fmG_Id: Number(item.fmG_Id ?? item.fmg_id ?? item.FMG_Id ?? 0),
            ftI_Id: Number(item.ftI_Id ?? item.fti_id ?? item.FTI_Id ?? 0),
            fmT_Id: Number(item.fmT_Id ?? item.fmt_id ?? item.FMT_Id ?? 0),
            fsS_ToBePaid: Number(item.fsS_ToBePaid ?? item.fss_tobepaid ?? 0),
            fsS_CurrentYrCharges: Number(item.fsS_CurrentYrCharges ?? item.fsS_NetAmount ?? item.totalcharges ?? 0),
            fmH_FeeName: item.fmH_FeeName ?? item.feehead ?? '',
            ftI_Name: item.ftI_Name ?? item.installmentname ?? ''
        }));

        const miId =
            mI_Id ||
            (studentInfoDetails as any)?.mI_Id ||
            (studentInfoDetails as any)?.MI_Id ||
            (studentInfoDetails?.studentInfo as any)?.mI_Id ||
            (studentInfoDetails?.studentInfo as any)?.MI_Id ||
            (studentInfoDetails?.studentInfo as any)?.mi_id ||
            0;

        const amstId =
            studentInfoDetails?.studentInfo?.amst_Id ||
            (studentInfoDetails?.studentInfo as any)?.AMST_Id ||
            (studentInfoDetails?.studentInfo as any)?.amsT_Id ||
            0;

        const asmclId =
            studentInfoDetails?.studentInfo?.asmcL_ID ||
            (studentInfoDetails?.studentInfo as any)?.ASMCL_Id ||
            (studentInfoDetails?.studentInfo as any)?.asmcl_id ||
            0;

        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const edvironCallbackUrl = `${currentOrigin}/api/FeeOnlinePayment/EdvironnResponse`;

        const payload = {
            MI_Id: miId,
            AMST_Id: amstId,
            ASMCL_Id: asmclId,
            ASMAY_Id: academicYear,
            FYP_PayModeType: 'Portal',
            onlinepaygteway: gateway,
            topayamount: totalAmt,
            selected_list,
            selectedlist_partialpayment: mappedFeeItems,
            temarray: mappedFeeItems,
            surl: edvironCallbackUrl,
            furl: edvironCallbackUrl,
            return_url: edvironCallbackUrl,
            returnurl: edvironCallbackUrl,
            redirect_url: edvironCallbackUrl,
            redirecturl: edvironCallbackUrl,
            callback_url: edvironCallbackUrl,
            callbackurl: edvironCallbackUrl
        };

        try {
            setIsPaymentLoading(true);

            // Persist pending payment info for recovery upon gateway return
            const student = studentInfoDetails?.studentInfo;
            const studentName = `${student?.amsT_FirstName || ''} ${student?.amsT_LastName || ''}`.trim() || 'Student';
            const admNo = student?.amsT_AdmNo || student?.amsT_RegistrationNo || '';

            if (typeof window !== 'undefined') {
                sessionStorage.setItem(
                    'pending_fee_payment',
                    JSON.stringify({
                        amount: totalAmt,
                        studentName,
                        admNo,
                        gateway: gateway || 'Payment Gateway',
                        mI_Id: miId
                    })
                );
            }

            const paymentResponse = await generateHashSequence(payload);

            if (!paymentResponse?.success || !paymentResponse?.data) {
                toast.error(paymentResponse?.message || 'Payment initiation failed. Please try again.');
                return;
            }

            const resData = paymentResponse.data;
            const pgData = resData?.paymentGatewayData || resData;

            // Edviron returns a complete signed redirect URL in strdatanew.
            if (gatewayUpper.includes('EDVIRON')) {
                const rawRedirectUrl = pgData?.strdatanew || resData?.strdatanew || pgData?.redirect_url || resData?.redirect_url;

                if (typeof rawRedirectUrl !== 'string' || !rawRedirectUrl.trim()) {
                    toast.error('Edviron payment URL was not received from the API.');
                    return;
                }

                try {
                    // Replace any hardcoded unreachable localhost:57606 with the actual running origin
                    const currentHost = window.location.host;
                    const edvironRedirectUrl = rawRedirectUrl
                        .replace(/https?:\/\/localhost:57606/gi, currentOrigin)
                        .replace(/https?%3A%2F%2Flocalhost%3A57606/gi, encodeURIComponent(currentOrigin))
                        .replace(/localhost:57606/gi, currentHost)
                        .replace(/localhost%3A57606/gi, encodeURIComponent(currentHost));

                    const parsedEdvironUrl = new URL(edvironRedirectUrl);

                    if (
                        parsedEdvironUrl.protocol !== 'https:' ||
                        (!parsedEdvironUrl.hostname.includes('edviron') && !parsedEdvironUrl.hostname.endsWith('edviron.in'))
                    ) {
                        throw new Error('Invalid Edviron payment URL');
                    }

                    toast.success('Redirecting to Edviron Payment Gateway...');
                    window.location.assign(edvironRedirectUrl);
                    return;
                } catch (error) {
                    console.error('Edviron redirect error:', error);
                    toast.error('Invalid Edviron payment URL received from the API.');
                    return;
                }
            }

            // Angular equivalent:
            // var strdata = promise.strdatanew;
            // $scope.htmldata = promise.strdatanew;
            // var e1 = angular.element(document.getElementById("test"));
            // $compile(e1.html($scope.htmldata))(($scope));
            const strdata =
                pgData?.strdatanew ||
                resData?.strdatanew ||
                pgData?.html_form ||
                pgData?.htmldata ||
                pgData?.html ||
                resData?.html_form ||
                resData?.htmldata ||
                (typeof resData === 'string' && resData.includes('<form') ? resData : null);

            if (strdata) {
                toast.success('Redirecting to Payment Gateway...');

                // Ensure surl and furl redirect back to our application instead of unreachable localhost:57606
                const callbackUrl = `${window.location.origin}/api/FeeOnlinePayment/paymentresponseeasybuzz`;
                const sanitizedStrdata =
                    typeof strdata === 'string'
                        ? strdata.replace(/https?:\/\/localhost:57606\/api\/FeeOnlinePayment\/paymentresponseeasybuzz\/?/gi, callbackUrl)
                        : strdata;

                const e1 = document.getElementById('test');
                if (e1) {
                    e1.innerHTML = '';
                    const fragment = document.createRange().createContextualFragment(sanitizedStrdata);
                    e1.appendChild(fragment);

                    // Submit form immediately
                    const form =
                        (e1.querySelector('form') as HTMLFormElement | null) ||
                        (document.getElementById('PostForm') as HTMLFormElement | null) ||
                        (document.forms.namedItem('PostForm') as HTMLFormElement | null);

                    if (form) {
                        // Ensure surl and furl are explicitly updated on form elements
                        let surlInput = form.querySelector('input[name="surl"]') as HTMLInputElement | null;
                        if (surlInput) {
                            surlInput.value = callbackUrl;
                        } else {
                            surlInput = document.createElement('input');
                            surlInput.type = 'hidden';
                            surlInput.name = 'surl';
                            surlInput.value = callbackUrl;
                            form.appendChild(surlInput);
                        }

                        let furlInput = form.querySelector('input[name="furl"]') as HTMLInputElement | null;
                        if (furlInput) {
                            furlInput.value = callbackUrl;
                        } else {
                            furlInput = document.createElement('input');
                            furlInput.type = 'hidden';
                            furlInput.name = 'furl';
                            furlInput.value = callbackUrl;
                            form.appendChild(furlInput);
                        }

                        form.submit();
                        return;
                    }
                }
            }

            // 2. Specific Easebuzz handling fallback
            if (gatewayUpper === 'EASEBUZZ') {
                if (pgData?.url) {
                    window.location.href = pgData.url;
                    return;
                }
                const accessKey = pgData?.access_key || pgData?.paymentKey || pgData?.payment_key || pgData?.key;
                if (accessKey && typeof accessKey === 'string' && !accessKey.startsWith('rzp_')) {
                    window.location.href = `https://pay.easebuzz.in/pay/${accessKey}`;
                    return;
                }
                if (Array.isArray(pgData?.paydet) && pgData.paydet.length > 0) {
                    const payItem = { ...pgData.paydet[0] };
                    const callbackUrl = `${window.location.origin}/api/FeeOnlinePayment/paymentresponseeasybuzz`;
                    if (payItem.surl) payItem.surl = callbackUrl;
                    if (payItem.furl) payItem.furl = callbackUrl;
                    const actionUrl = pgData.url || payItem.payu_URL || payItem.url || payItem.action || 'https://pay.easebuzz.in/pay';
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = actionUrl;
                    form.style.display = 'none';
                    for (const [key, val] of Object.entries(payItem)) {
                        if (val !== undefined && val !== null) {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = String(val);
                            form.appendChild(input);
                        }
                    }
                    document.body.appendChild(form);
                    form.submit();
                    return;
                }
            }

            // 3. Razorpay checkout
            if (gatewayUpper === 'RAZORPAY') {
                const rzpData = { ...resData, ...pgData };
                const razorpayKey = rzpData.merchantkey || rzpData.key || rzpData.key_id;
                const razorpayOrderId = rzpData.trans_id || rzpData.order_id;
                if (!razorpayKey || !razorpayOrderId) {
                    toast.error('Razorpay credentials were not received. Please contact your administrator.');
                    return;
                }

                const studentAddress = student?.amsT_Address || student?.amsT_PerCity || '';
                const splitPayInformation = rzpData.splitpayinformation || '';
                const options = {
                    key: razorpayKey,
                    amount: Number(rzpData.fmA_Amount || totalAmt) * 100,
                    currency: 'INR',
                    name: rzpData.institutioname || rzpData.inT_NAME || 'Student Fee Payment',
                    description: 'Fee Payment',
                    image: rzpData.institulogo || rzpData.institutioN_LOGO || '/assets/images/logo.png',
                    order_id: razorpayOrderId,
                    handler: async (response: any) => {
                        toast.success(`Payment Successful: ${response.razorpay_payment_id}`);
                        try {
                            await verifyRazorpayPayment({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                receiptNo: rzpData.fyP_Receipt_No || '',
                                ...rzpData
                            });
                        } catch (err) {
                            console.error('Error verifying Razorpay payment:', err);
                        }

                        setPaymentModalState({
                            isOpen: true,
                            status: 'success',
                            transactionId: response.razorpay_payment_id || rzpData.trans_id,
                            receiptNo: rzpData.fyP_Receipt_No || '',
                            amount: totalAmt,
                            date: new Date().toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            }),
                            gateway: 'Razorpay',
                            studentName,
                            admNo,
                            message: 'Payment completed successfully via Razorpay.'
                        });

                        if (typeof window !== 'undefined') {
                            sessionStorage.removeItem('pending_fee_payment');
                        }
                        refetchAll();
                    },
                    prefill: {
                        name: studentName,
                        email: student?.amst_email_id || '',
                        contact: student?.amst_mobile ? String(student.amst_mobile) : ''
                    },
                    notes: {
                        notes_1: studentName,
                        notes_2: student?.amst_mobile ? String(student.amst_mobile) : '',
                        notes_3: student?.amst_email_id || '',
                        notes_4: studentAddress,
                        notes_5: admNo,
                        notes_6: splitPayInformation,
                        notes_7: String(rzpData.mI_Id || miId),
                        notes_8: String(rzpData.asmaY_Id || academicYear || ''),
                        notes_9: String(rzpData.amst_Id || amstId)
                    },
                    theme: {
                        color: '#F37254'
                    },
                    external: {
                        wallets: ['paytm']
                    },
                    modal: {
                        ondismiss: () => {
                            setPaymentModalState({
                                isOpen: true,
                                status: 'cancelled',
                                transactionId: rzpData.trans_id || '',
                                amount: totalAmt,
                                date: new Date().toLocaleString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                }),
                                gateway: 'Razorpay',
                                studentName,
                                admNo,
                                message: 'Payment window was closed. No amount has been deducted from your account.'
                            });

                            if (typeof window !== 'undefined') {
                                sessionStorage.removeItem('pending_fee_payment');
                            }
                        }
                    }
                };
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
                return;
            }

            // 4. Redirect URL fallback
            if (resData.redirect_url || resData.payment_url || resData.url) {
                window.location.href = resData.redirect_url || resData.payment_url || resData.url;
                return;
            }

            // 5. Generic paydet post form (PayU / Paytm etc.)
            if (Array.isArray(resData.paydet) && resData.paydet.length > 0) {
                const payItem = { ...resData.paydet[0] };
                const callbackUrl = `${window.location.origin}/api/FeeOnlinePayment/paymentresponseeasybuzz`;
                if (payItem.surl) payItem.surl = callbackUrl;
                if (payItem.furl) payItem.furl = callbackUrl;
                const actionUrl = resData.url || payItem.payu_URL || payItem.url || payItem.action;
                if (actionUrl) {
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.action = actionUrl;
                    form.style.display = 'none';
                    for (const [key, val] of Object.entries(payItem)) {
                        if (val !== undefined && val !== null) {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = String(val);
                            form.appendChild(input);
                        }
                    }
                    document.body.appendChild(form);
                    form.submit();
                    return;
                }
            }

            toast.success('Payment request submitted successfully');
        } catch (error: any) {
            console.error('Payment initiation error:', error);
            toast.error(error?.message || 'An error occurred while processing payment.');
        } finally {
            setIsPaymentLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            <Script
                src='https://checkout.razorpay.com/v1/checkout.js'
                strategy='afterInteractive'
                onReady={() => setIsRazorpayReady(true)}
                onError={() => {
                    setIsRazorpayReady(false);
                    toast.error('Unable to load Razorpay. Please refresh the page and try again.');
                }}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Fee Online Payment</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {isAcademicLoading ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='text-center'>
                                <Loader2 className='mx-auto mb-3 h-8 w-8 animate-spin text-primary' />
                                <div className='font-medium text-muted-foreground text-sm'>Loading academic details...</div>
                            </div>
                        </div>
                    ) : !response ? (
                        <div className='flex items-center justify-center py-12'>
                            <div className='text-center text-muted-foreground text-sm'>No data available. Please try again later.</div>
                        </div>
                    ) : (
                        <>
                            <div className='flex items-center space-x-4'>
                                <label htmlFor='academic-year' className='w-1/4 font-semibold'>
                                    Academic Year: <span className='text-red-500'>*</span>
                                </label>
                                <div className='flex w-1/3 items-center space-x-3'>
                                    <Select
                                        value={academicYear ? String(academicYear) : undefined}
                                        onValueChange={(val) => {
                                            setAcademicYear(Number(val));
                                            setShowPaymentDetails(false);
                                        }}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {response?.data?.map((year: any) => (
                                                <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* {isStudentDataLoading && <Loader2 className='h-5 w-5 shrink-0 animate-spin text-primary' />} */}
                                </div>
                            </div>

                            <div className='relative space-y-6'>
                                {isStudentDataLoading && (
                                    <div className='absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px] transition-all dark:bg-card/75'>
                                        <div className='flex items-center space-x-3 rounded-lg border bg-background px-4 py-3 shadow-md'>
                                            <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                            <span className='font-medium text-foreground text-sm'>Loading academic year details...</span>
                                        </div>
                                    </div>
                                )}

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div className='rounded-md border p-4'>
                                        <h3 className='mb-4 font-bold text-primary'>Student Information</h3>
                                        {(() => {
                                            const rawStudent = studentInfoDetails?.studentInfo;
                                            const student = Array.isArray(rawStudent) ? rawStudent[0] : rawStudent;
                                            return student ? (
                                                <div className='space-y-2 text-sm'>
                                                    <div className='grid grid-cols-3'>
                                                        <span className='font-semibold'>Name</span>
                                                        <span className='col-span-2'>
                                                            : {student.amsT_FirstName || ''} {student.amsT_LastName || ''}
                                                        </span>
                                                    </div>
                                                    <div className='grid grid-cols-3'>
                                                        <span className='font-semibold'>Class/Section/Roll No</span>
                                                        <span className='col-span-2'>
                                                            : {student.classname || '-'} / {student.sectionname || '-'} /{' '}
                                                            {student.amaY_RollNo || '-'}
                                                        </span>
                                                    </div>
                                                    <div className='grid grid-cols-3'>
                                                        <span className='font-semibold'>Adm No</span>
                                                        <span className='col-span-2'>: {student.amsT_AdmNo || '-'}</span>
                                                    </div>
                                                    <div className='grid grid-cols-3'>
                                                        <span className='font-semibold'>Reg No</span>
                                                        <span className='col-span-2'>: {student.amsT_RegistrationNo || '-'}</span>
                                                    </div>
                                                    <div className='grid grid-cols-3'>
                                                        <span className='font-semibold'>Mobile No</span>
                                                        <span className='col-span-2'>: {student.amst_mobile || ''}</span>
                                                    </div>
                                                    <div className='grid grid-cols-3'>
                                                        <span className='font-semibold'>Email Id</span>
                                                        <span className='col-span-2'>: {student.amst_email_id || ''}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className='text-center text-gray-500'>No student information available</div>
                                            );
                                        })()}
                                    </div>

                                    {/* Group Selection */}
                                    <div className='h-64 overflow-y-auto rounded-md border p-4'>
                                        <h3 className='mb-4 font-bold text-primary'>
                                            Group List <span className='text-red-500'>*</span>
                                        </h3>
                                        {Array.isArray(groupTermList) && groupTermList.length > 0 ? (
                                            <div className='space-y-2'>
                                                {groupTermList.map((grpItem, grpIndex) => (
                                                    <div key={`${grpItem?.grp?.fmgG_Id ?? grpIndex}-${grpIndex}`} className='space-y-1'>
                                                        <div className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                checked={grpItem?.grp?.checkedgrplst ?? false}
                                                                onCheckedChange={(checked) => handleGroupCheck(grpIndex, !!checked)}
                                                                disabled={grpItem?.grp?.grpdisable}
                                                            />
                                                            <span className='font-medium'>{grpItem?.grp?.fmgG_GroupName || 'Group'}</span>
                                                        </div>
                                                        <div className='ml-6 space-y-1'>
                                                            {Array.isArray(grpItem?.trm_list) &&
                                                                grpItem.trm_list.map((trm, trmIndex) => (
                                                                    <div
                                                                        key={`${trm?.fmT_Id ?? trmIndex}-${trmIndex}`}
                                                                        className='flex items-center space-x-2'>
                                                                        <Checkbox
                                                                            checked={trm?.checkedheadlst ?? false}
                                                                            onCheckedChange={(checked) =>
                                                                                handleTermCheck(grpIndex, trmIndex, !!checked)
                                                                            }
                                                                            disabled={trm?.termdisablechk}
                                                                        />
                                                                        <span>{trm?.fmT_Name || 'Term'}</span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='text-center text-gray-500'>No groups available</div>
                                        )}
                                    </div>
                                </div>

                                {/* Fee Summary */}
                                <div className='rounded-lg border bg-card p-4 shadow-sm'>
                                    <h3 className='mb-4 font-bold text-primary'>Fee Summary</h3>
                                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                                        {/* Current Year Charges */}
                                        <div className='rounded-lg border border-sky-100/60 bg-[#EAF6FD] p-4 dark:border-sky-900/30 dark:bg-sky-950/30'>
                                            <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>
                                                Current Year Charges
                                            </span>
                                            <p className='mt-1.5 font-bold text-[#0284c7] text-xl'>{formatCurrency(charges)}</p>
                                        </div>

                                        {/* Current Year Paid */}
                                        <div className='rounded-lg border border-emerald-100/60 bg-[#EAFBF3] p-4 dark:border-emerald-900/30 dark:bg-emerald-950/30'>
                                            <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>
                                                Current Year Paid
                                            </span>
                                            <p className='mt-1.5 font-bold text-[#16a34a] text-xl'>{formatCurrency(paid)}</p>
                                        </div>

                                        {/* Current Year Outstanding */}
                                        <div className='rounded-lg border border-rose-100/60 bg-[#FEEFEF] p-4 dark:border-rose-900/30 dark:bg-rose-950/30'>
                                            <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>
                                                Current Year Outstanding
                                            </span>
                                            <p className='mt-1.5 font-bold text-[#dc2626] text-xl'>{formatCurrency(outstanding)}</p>
                                        </div>

                                        {/* Current Year Concession */}
                                        <div className='rounded-lg border border-purple-100/60 bg-[#F8F2FF] p-4 dark:border-purple-900/30 dark:bg-purple-950/30'>
                                            <span className='block font-medium text-slate-500 text-xs dark:text-slate-400'>
                                                Current Year Concession
                                            </span>
                                            <p className='mt-1.5 font-bold text-[#9333ea] text-xl'>{formatCurrency(concession)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-6 flex flex-wrap items-center justify-center gap-4'>
                                <Button
                                    type='button'
                                    onClick={handleShowDetails}
                                    disabled={isStudentDataLoading || isDetailsLoading}
                                    className='h-10 min-w-[200px] max-w-[260px] flex-1 rounded-lg bg-[#F05A28] font-medium text-sm text-white shadow-sm transition-colors hover:bg-[#d94a1d] disabled:opacity-50'>
                                    {isDetailsLoading ? (
                                        <span className='flex items-center justify-center gap-2'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Loading...
                                        </span>
                                    ) : (
                                        'Show'
                                    )}
                                </Button>
                                <Button
                                    type='button'
                                    variant='destructive'
                                    onClick={() => window.location.reload()}
                                    disabled={isDetailsLoading}
                                    className='h-10 min-w-[200px] max-w-[260px] flex-1 rounded-lg bg-[#E53935] font-medium text-sm text-white shadow-sm transition-colors hover:bg-[#c62828] disabled:opacity-50'>
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {isDetailsLoading && (
                <Card>
                    <CardContent className='flex flex-col items-center justify-center py-12'>
                        <Loader2 className='mb-3 h-8 w-8 animate-spin text-primary' />
                        <p className='font-medium text-muted-foreground text-sm'>Fetching fee details, please wait...</p>
                    </CardContent>
                </Card>
            )}

            {showPaymentDetails && !isDetailsLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='rounded-md border'>
                            <table className='w-full text-sm'>
                                <thead className='bg-muted'>
                                    <tr>
                                        <th className='border p-2'>
                                            <Checkbox checked={true} disabled />
                                        </th>
                                        <th className='border p-2'>SLNO</th>
                                        <th className='border p-2'>Head Name</th>
                                        <th className='border p-2'>Installment</th>
                                        <th className='border p-2'>Opening Balance</th>
                                        <th className='border p-2'>Receivable</th>
                                        <th className='border p-2'>Charges</th>
                                        <th className='border p-2'>Concession</th>
                                        <th className='border p-2'>Fine</th>
                                        <th className='border p-2'>Payable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeDetails.length > 0 ? (
                                        feeDetails.map((row, index) => (
                                            <tr key={index} className='border-b'>
                                                <td className='border p-2 text-center'>
                                                    <Checkbox checked={true} disabled />
                                                </td>
                                                <td className='border p-2 text-center'>{index + 1}</td>
                                                <td className='border p-2'>{row.fmH_FeeName}</td>
                                                <td className='border p-2'>{row.ftI_Name}</td>
                                                <td className='border p-2 text-right'>{row.fsS_OBArrearAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_NetAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_TotalToBePaid || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_ConcessionAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_FineAmount || 0}</td>
                                                <td className='border p-2 text-right'>{row.fsS_ToBePaid || 0}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className='p-4 text-center text-gray-500'>
                                                No fee details available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className='mt-4 flex flex-col items-center justify-center space-y-2'>
                            <div className='flex items-center space-x-4'>
                                <label htmlFor='' className='font-bold'>
                                    Total Rebate:
                                </label>
                                <Input value={rebate} readOnly className='w-32 font-bold' />
                                <label htmlFor='' className='font-bold'>
                                    Total Payable:
                                </label>
                                <Input value={totalAmt} readOnly className='w-32 font-bold' />
                            </div>

                            <div className='mt-4 flex flex-wrap gap-4'>
                                {paymentGateWay.length > 0 &&
                                    paymentGateWay.map((gatewayItem: any, idx: number) => {
                                        const gwName = gatewayItem.fpgD_PGName;
                                        return (
                                            <div
                                                key={gatewayItem.fpgD_Id || gwName || idx}
                                                className={`flex cursor-pointer items-center space-x-2 rounded border p-4 hover:bg-muted ${
                                                    gateway === gwName ? 'border-primary bg-muted' : ''
                                                }`}
                                                onClick={() => setGateway(gwName)}>
                                                <input type='radio' checked={gateway === gwName} readOnly />
                                                <span className='font-bold'>{gwName}</span>
                                            </div>
                                        );
                                    })}
                            </div>

                            <div className='mt-4 flex flex-wrap items-center justify-center gap-3'>
                                <Button
                                    size='lg'
                                    className='bg-green-600 font-semibold shadow-sm hover:bg-green-700'
                                    onClick={handlePayment}
                                    disabled={!gateway || totalAmt === 0 || isPaymentLoading}>
                                    {isPaymentLoading ? (
                                        <span className='flex items-center gap-2'>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Processing Payment...
                                        </span>
                                    ) : (
                                        'CLICK HERE TO PAY NOW'
                                    )}
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    disabled={isPaymentLoading}
                                    className='border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700'
                                    onClick={() => {
                                        const prevAmt = totalAmt;
                                        setShowPaymentDetails(false);
                                        setFeeDetails([]);
                                        setTotalAmt(0);
                                        setPaymentModalState({
                                            isOpen: true,
                                            status: 'cancelled',
                                            amount: prevAmt,
                                            gateway: gateway || 'Online Payment',
                                            studentName: studentInfoDetails?.studentInfo
                                                ? `${studentInfoDetails.studentInfo.amsT_FirstName || ''} ${studentInfoDetails.studentInfo.amsT_LastName || ''}`.trim()
                                                : '',
                                            admNo: studentInfoDetails?.studentInfo?.amsT_AdmNo || '',
                                            date: new Date().toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }),
                                            message: 'Payment process was cancelled by the user.'
                                        });
                                    }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Gateway Form Container (Equivalent to angular #test element) */}
            <div id='test' />

            {/* Payment Status Modal / Pop-up */}
            <Dialog
                open={paymentModalState.isOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleOkAndRefresh();
                    }
                }}>
                <DialogContent className='max-w-md overflow-hidden rounded-2xl border bg-background p-0 shadow-2xl sm:max-w-lg'>
                    {/* Header Banner */}
                    <div
                        className={`p-6 text-center ${
                            paymentModalState.status === 'success'
                                ? 'bg-gradient-to-b from-emerald-50 to-background dark:from-emerald-950/40 dark:to-background'
                                : paymentModalState.status === 'cancelled'
                                  ? 'bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/40 dark:to-background'
                                  : 'bg-gradient-to-b from-rose-50 to-background dark:from-rose-950/40 dark:to-background'
                        }`}>
                        {/* Status Icon */}
                        {paymentModalState.status === 'success' ? (
                            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50 dark:bg-emerald-950/70 dark:text-emerald-400 dark:ring-emerald-950/30'>
                                <CheckCircle2 className='h-9 w-9 stroke-[2.5]' />
                            </div>
                        ) : paymentModalState.status === 'cancelled' ? (
                            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-8 ring-amber-50 dark:bg-amber-950/70 dark:text-amber-400 dark:ring-amber-950/30'>
                                <AlertCircle className='h-9 w-9 stroke-[2.5]' />
                            </div>
                        ) : (
                            <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 ring-8 ring-rose-50 dark:bg-rose-950/70 dark:text-rose-400 dark:ring-rose-950/30'>
                                <XCircle className='h-9 w-9 stroke-[2.5]' />
                            </div>
                        )}

                        <DialogTitle className='mt-4 font-bold text-2xl text-foreground tracking-tight'>
                            {paymentModalState.status === 'success'
                                ? 'Payment Successful!'
                                : paymentModalState.status === 'cancelled'
                                  ? 'Payment Cancelled'
                                  : 'Payment Failed'}
                        </DialogTitle>
                        <DialogDescription className='mt-1 text-muted-foreground text-sm'>
                            {paymentModalState.message ||
                                (paymentModalState.status === 'success'
                                    ? 'Your online fee payment was completed successfully.'
                                    : paymentModalState.status === 'cancelled'
                                      ? 'The payment was cancelled. No amount was debited.'
                                      : 'The transaction could not be completed.')}
                        </DialogDescription>

                        {/* Amount Card */}
                        <div
                            className={`mt-5 rounded-xl border p-4 text-center ${
                                paymentModalState.status === 'success'
                                    ? 'border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/30'
                                    : paymentModalState.status === 'cancelled'
                                      ? 'border-amber-200/80 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/30'
                                      : 'border-rose-200/80 bg-rose-50/70 dark:border-rose-900/40 dark:bg-rose-950/30'
                            }`}>
                            <p
                                className={`font-semibold text-xs uppercase tracking-wider ${
                                    paymentModalState.status === 'success'
                                        ? 'text-emerald-700 dark:text-emerald-400'
                                        : paymentModalState.status === 'cancelled'
                                          ? 'text-amber-700 dark:text-amber-400'
                                          : 'text-rose-700 dark:text-rose-400'
                                }`}>
                                {paymentModalState.status === 'success' ? 'Total Amount Paid' : 'Transaction Amount'}
                            </p>
                            <p
                                className={`mt-1 font-extrabold text-3xl ${
                                    paymentModalState.status === 'success'
                                        ? 'text-emerald-700 dark:text-emerald-300'
                                        : paymentModalState.status === 'cancelled'
                                          ? 'text-amber-700 dark:text-amber-300'
                                          : 'text-rose-700 dark:text-rose-300'
                                }`}>
                                ₹ {Number(paymentModalState.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Transaction Details Body */}
                    <div className='space-y-2.5 px-6 pb-2 text-xs sm:text-sm'>
                        <div className='space-y-2.5 rounded-xl border bg-muted/30 p-3.5'>
                            {paymentModalState.receiptNo && (
                                <div className='flex items-center justify-between border-border/60 border-b pb-2'>
                                    <span className='flex items-center gap-1.5 text-muted-foreground'>
                                        <Receipt className='h-3.5 w-3.5' /> Receipt No
                                    </span>
                                    <span className='font-bold font-mono text-foreground'>{paymentModalState.receiptNo}</span>
                                </div>
                            )}

                            {paymentModalState.transactionId && (
                                <div className='flex items-center justify-between border-border/60 border-b pb-2'>
                                    <span className='flex items-center gap-1.5 text-muted-foreground'>
                                        <Hash className='h-3.5 w-3.5' /> Transaction ID
                                    </span>
                                    <div className='flex items-center gap-1.5'>
                                        <span className='font-medium font-mono text-foreground text-xs'>
                                            {paymentModalState.transactionId}
                                        </span>
                                        <button
                                            type='button'
                                            onClick={() => {
                                                navigator.clipboard.writeText(paymentModalState.transactionId || '');
                                                setCopiedTxn(true);
                                                toast.success('Transaction ID copied');
                                                setTimeout(() => setCopiedTxn(false), 2000);
                                            }}
                                            className='rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                                            title='Copy'>
                                            {copiedTxn ? (
                                                <Check className='h-3.5 w-3.5 text-emerald-600' />
                                            ) : (
                                                <Copy className='h-3.5 w-3.5' />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentModalState.studentName && (
                                <div className='flex items-center justify-between border-border/60 border-b pb-2'>
                                    <span className='flex items-center gap-1.5 text-muted-foreground'>
                                        <User className='h-3.5 w-3.5' /> Student
                                    </span>
                                    <span className='text-right font-medium text-foreground'>{paymentModalState.studentName}</span>
                                </div>
                            )}

                            {paymentModalState.admNo && (
                                <div className='flex items-center justify-between border-border/60 border-b pb-2'>
                                    <span className='flex items-center gap-1.5 text-muted-foreground'>
                                        <FileText className='h-3.5 w-3.5' /> Adm / Reg No
                                    </span>
                                    <span className='font-medium font-mono text-foreground'>{paymentModalState.admNo}</span>
                                </div>
                            )}

                            <div className='flex items-center justify-between border-border/60 border-b pb-2'>
                                <span className='flex items-center gap-1.5 text-muted-foreground'>
                                    <Calendar className='h-3.5 w-3.5' /> Date & Time
                                </span>
                                <span className='font-medium text-foreground text-xs sm:text-sm'>
                                    {paymentModalState.date || new Date().toLocaleString('en-IN')}
                                </span>
                            </div>

                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Payment Mode</span>
                                <span className='font-semibold text-foreground'>{paymentModalState.gateway || 'Online Payment'}</span>
                            </div>
                        </div>

                        {paymentModalState.status === 'cancelled' && (
                            <p className='rounded-lg border border-amber-200/50 bg-amber-50/50 p-2.5 text-amber-700 text-xs dark:bg-amber-950/20 dark:text-amber-400'>
                                💡 Your fee selections have been preserved. You can try again anytime.
                            </p>
                        )}
                        {paymentModalState.status === 'failed' && (
                            <p className='rounded-lg border border-rose-200/50 bg-rose-50/50 p-2.5 text-rose-700 text-xs dark:bg-rose-950/20 dark:text-rose-400'>
                                ⚠️ If an amount was deducted from your bank, it will be refunded within 3-5 working days.
                            </p>
                        )}
                    </div>

                    {/* Dialog Footer Actions */}
                    <DialogFooter className='flex flex-col gap-2 p-6 pt-2 sm:flex-row'>
                        {paymentModalState.status === 'success' ? (
                            <>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => window.print()}
                                    className='flex w-full items-center justify-center gap-2 sm:w-auto'>
                                    <Printer className='h-4 w-4' /> Print Receipt
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleOkAndRefresh}
                                    className='w-full flex-1 bg-emerald-600 font-semibold text-white hover:bg-emerald-700 sm:w-auto'>
                                    OK
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type='button'
                                    onClick={handleOkAndRefresh}
                                    className='w-full flex-1 bg-primary font-semibold text-primary-foreground sm:w-auto'>
                                    OK
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
