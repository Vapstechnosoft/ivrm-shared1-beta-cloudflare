'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useParentDashboard } from '@/hooks/admission/preadmission/useReports';
import { useActivePreadmissionDetails, useDocumentDownload } from '@/hooks/admission/preadmission/useTransactions';
import { applicationFormInitiatePayment } from '@/server/admission/preadmission/transactions/application_form';
import type { IParentsDashboardStudentResponse } from '@/types/admission/preadmission/reports';
import type { IInitiatePaymentResponse } from '@/types/admission/preadmission/transactions';
import { ArrowUpRight, CreditCard, Edit, Eye, Hash, IndianRupee, Loader2, Mail, Phone, ReceiptIndianRupee, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function ParentsDashboard({ className }: { className?: string } = {}) {
    const { data: activePreadmission, isLoading: activePreadmissionLoading } = useActivePreadmissionDetails();
    const asmayId = activePreadmission?.data?.asmaY_Id ?? 0;
    const { data: parentDashboard, isLoading: parentDashboardLoading, refetchAll: refetchAllParentDashboard } = useParentDashboard(asmayId);

    // Document / PDF Modal State
    const [appId, setAppId] = useState(0);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const { mutate: downloadDocument, isPending: isPdfLoading } = useDocumentDownload();
    const [iframeLoading, setIframeLoading] = useState(false);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);

    // Payment Dialog State
    const [selectedPaymentStudent, setSelectedPaymentStudent] = useState<IParentsDashboardStudentResponse | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [paymentData, setPaymentData] = useState<IInitiatePaymentResponse | null>(null);
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const formContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showPdfModal && pdfBase64 && appId > 0) {
            setIframeLoading(true);
        }
        if (!showPdfModal) setIframeLoading(false);
    }, [showPdfModal, pdfBase64, appId]);

    useEffect(() => {
        // Trigger download when modal opens and user is authorized
        if (showPdfModal && !pdfBase64 && appId > 0) {
            downloadDocument(appId, {
                onSuccess: (data) => {
    const payload = data?.data;

    const base64 =
        typeof payload === 'string'
            ? payload
            : Array.isArray(payload)
              ? ((payload[0] as unknown as string) ?? null)
              : ((payload as unknown as { pdfbase64?: string } | undefined)?.pdfbase64 ?? null);

    setPdfBase64(base64);
},
                onError: (error) => {
                    console.error('Failed to load document:', error);
                    toast.error('Failed to load document');
                    setPdfBase64(null);
                }
            });
        }
    }, [showPdfModal, pdfBase64, appId, downloadDocument]);

    useEffect(() => {
        if (isPaymentDialogOpen && selectedPaymentStudent) {
            fetchPaymentDetails(selectedPaymentStudent.pasr_id);
        }
    }, [isPaymentDialogOpen, selectedPaymentStudent]);

    const fetchPaymentDetails = async (pasrId: number) => {
        setIsPaymentLoading(true);
        try {
            const response = await applicationFormInitiatePayment(pasrId);
            if (response.success && response.data != null && (response.data?.html_form || response.data?.payment_url)) {
                setPaymentData(response.data);
            } else {
                toast.error(response.message || 'Unable to initiate payment');
                setIsPaymentDialogOpen(false);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to initiate payment');
            setIsPaymentDialogOpen(false);
        } finally {
            setIsPaymentLoading(false);
        }
    };

    const handlePayNow = () => {
        if (!paymentData) return;

        setIsPaymentProcessing(true);

        if (paymentData.html_form && formContainerRef.current) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = paymentData.html_form;
            const form = tempDiv.querySelector('form');

            if (form) {
                const scripts = tempDiv.querySelectorAll('script');
                scripts.forEach((script) => script.remove());

                formContainerRef.current.appendChild(form);
                form.submit();
                return;
            }
        }

        if (paymentData.payment_url) {
            window.location.href = paymentData.payment_url;
            return;
        }

        toast.error('Payment form could not be loaded');
        setIsPaymentProcessing(false);
    };

    const closePaymentDialog = () => {
        setIsPaymentDialogOpen(false);
        setPaymentData(null);
        setSelectedPaymentStudent(null);
        setIsPaymentProcessing(false);
        refetchAllParentDashboard?.();
    };

    const applications: IParentsDashboardStudentResponse[] = parentDashboard?.data || [];

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACCEPTED':
            case 'APP ACCEPTED':
                return 'text-green-600 font-semibold';
            case 'CONFIRM':
                return 'text-green-600 font-semibold';
            case 'INPROGRESS':
                return 'text-amber-600 font-semibold';
            case 'APP WAITING':
            case 'WAITING':
                return 'text-gray-700 font-semibold';
            case 'REJECTED':
            case 'APP REJECTED':
                return 'text-red-600 font-semibold';
            default:
                return 'text-muted-foreground font-semibold';
        }
    };

    const handleViewAdmissionForm = (pasrId: number) => {
        setAppId(pasrId);
        setShowPdfModal(true);
    };

    const handleInitiatePayment = (student: IParentsDashboardStudentResponse) => {
        setSelectedPaymentStudent(student);
        setIsPaymentDialogOpen(true);
    };

    const isPaymentPending = (app: IParentsDashboardStudentResponse) => {
        return app.is_fee_applicable === 1 && Number(app.payment_status) === 0;
    };

    // Loading State
    if (activePreadmissionLoading || (asmayId > 0 && parentDashboardLoading)) {
        return (
            <div className={className || 'container mx-auto p-6'}>
                <div className='space-y-6'>
                    {[1].map((index) => (
                        <Card key={index} className='overflow-hidden border-border shadow-lg'>
                            <div className='p-6 md:p-8'>
                                <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_auto]'>
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <Skeleton className='h-6 w-full' />
                                            <Skeleton className='h-6 w-full' />
                                        </div>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <Skeleton className='h-6 w-full' />
                                            <Skeleton className='h-6 w-full' />
                                        </div>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <Skeleton className='h-6 w-full' />
                                            <Skeleton className='h-6 w-full' />
                                        </div>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <Skeleton className='h-6 w-3/4' />
                                            <Skeleton className='h-6 w-3/4' />
                                        </div>
                                        <div className='flex gap-3 pt-2'>
                                            <Skeleton className='h-10 w-48' />
                                        </div>
                                    </div>
                                    <div className='flex justify-center md:justify-end'>
                                        <Skeleton className='h-32 w-32 rounded-2xl md:h-40 md:w-40' />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className='mt-8 flex items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <span className='ml-3 text-muted-foreground'>Loading applications...</span>
                </div>
            </div>
        );
    }

    // Empty State (No applications filled yet - show Fill AdmissionForm button)
    if (!applications || applications.length === 0) {
        return (
            <div className='container mx-auto p-6'>
                <div className='py-12 text-center'>
                    <p className='text-lg text-muted-foreground'>No applications found</p>
                </div>
            </div>
        );
    }

    // When applications are already filled: show only dashboard (no Fill AdmissionForm button)
    return (
        <div className={className || 'container mx-auto p-6'}>
            <div className='space-y-6'>
                {applications.map((application) => (
                    <Card key={application.pasr_id} className='relative overflow-hidden rounded-2xl border-border shadow-lg'>
                        {/* Background Image */}
                        <div className='absolute inset-0'>
                            <Image src='/assets/sophia_banner.jpg' alt='School Banner' fill className='object-cover' priority />
                        </div>

                        {/* Overlay for better text readability */}
                        <div className='relative bg-black/40 backdrop-blur-[1px]'>
                            <div className='p-6 md:p-8'>
                                <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_auto]'>
                                    {/* Left Section - Student Details */}
                                    <div className='space-y-4'>
                                        {/* Row 1 */}
                                        <div className='grid grid-cols-1 gap-4 text-white md:grid-cols-2'>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold'>Name</span>
                                                <span className='font-semibold'>:</span>
                                                <span className='font-bold uppercase'>{application.student_name}</span>
                                            </div>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold'>Applied For</span>
                                                <span className='font-semibold'>:</span>
                                                <span className='font-bold'>{application.applied_class_name}</span>
                                            </div>
                                        </div>

                                        {/* Row 2 */}
                                        <div className='grid grid-cols-1 gap-4 text-white md:grid-cols-2'>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold'>DOB</span>
                                                <span className='font-semibold'>:</span>
                                                <span className='font-bold'>{application.date_of_birth}</span>
                                            </div>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold'>Mobile No.</span>
                                                <span className='font-semibold'>:</span>
                                                <span className='font-bold'>{application.mobile_no}</span>
                                            </div>
                                        </div>

                                        {/* Row 3 */}
                                        <div className='grid grid-cols-1 gap-4 text-white md:grid-cols-2'>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold'>Application NO</span>
                                                <span className='font-semibold'>:</span>
                                                <span className='font-bold'>{application.registration_number}</span>
                                            </div>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold'>Email-ID</span>
                                                <span className='font-semibold'>:</span>
                                                <span className='break-all font-bold'>{application.email_id}</span>
                                            </div>
                                        </div>

                                        {/* Row 4 - Status */}
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold text-white'>Application status:</span>
                                                <span
                                                    className={`font-bold uppercase ${getStatusColor(application.application_status)} rounded bg-white px-2 py-0.5`}>
                                                    {application.application_status}
                                                </span>
                                            </div>
                                            <div className='flex items-start gap-2'>
                                                <span className='min-w-[140px] font-semibold text-white'>Admission Status</span>
                                                <span className='font-semibold text-white'>:</span>
                                                <span
                                                    className={`font-bold uppercase ${getStatusColor(application.admission_status)} rounded bg-white px-2 py-0.5`}>
                                                    {application.admission_status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons: if payment not done then show pay to pay details else show application view */}
                                        <div className='flex flex-wrap items-center gap-3 pt-2'>
                                            {isPaymentPending(application) ? (
                                                <Button
                                                    onClick={() => handleInitiatePayment(application)}
                                                    className='flex w-fit items-center gap-2 bg-green-600 font-semibold text-white hover:bg-green-700'>
                                                    <CreditCard className='h-4 w-4' />
                                                    Pay Admission Fee
                                                    <ArrowUpRight className='h-4 w-4' />
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() => handleViewAdmissionForm(application.pasr_id)}
                                                        className='flex w-fit items-center gap-2 bg-primary font-semibold text-white hover:bg-primary/90'>
                                                        <Eye className='h-4 w-4' />
                                                        View Application Form
                                                    </Button>
                                                    {application.is_fee_applicable === 1 && Number(application.payment_status) === 1 && (
                                                        <Badge className='flex items-center gap-1.5 bg-green-600 px-3 py-1.5 font-bold text-white'>
                                                            <ReceiptIndianRupee className='h-3.5 w-3.5' /> Paid
                                                        </Badge>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Section - Student Photo */}
                                    <div className='flex justify-center md:justify-end'>
                                        <div className='relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl md:h-40 md:w-40'>
                                            {application.student_photo ? (
                                                <Image
                                                    src={application.student_photo}
                                                    alt={application.student_name}
                                                    fill
                                                    className='object-cover'
                                                    onError={(e) => {
                                                        // Fallback to default avatar on error
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className='flex h-full w-full items-center justify-center bg-muted'>
                                                    <User className='h-20 w-20 text-muted-foreground' />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {/* PDF Viewer Dialog */}
                {showPdfModal && (
                    <Dialog
                        open={showPdfModal}
                        onOpenChange={(open) => {
                            setShowPdfModal(open);
                            if (!open) {
                                setPdfBase64(null); // Clear PDF when closing
                                setAppId(0);
                            }
                        }}>
                        <DialogContent
                            className='flex h-[90vh] max-w-5xl flex-col p-0'
                            onInteractOutside={(e) => {
                                e.preventDefault(); // Prevents closing when clicking outside
                            }}>
                            <DialogHeader className='p-0'>
                                <DialogTitle className='pt-3 text-center font-semibold text-lg'>Preadmission Application Form</DialogTitle>
                            </DialogHeader>
                            <div className='relative min-h-0 flex-1 overflow-hidden'>
                                {/* Spinner while loading PDF */}
                                {(isPdfLoading || iframeLoading) && (
                                    <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
                                        <div className='transition-all'>
                                            <div className='flex flex-col items-center'>
                                                <Spinner size='lg' className='text-primary' />
                                                <p className='mt-3 font-medium text-gray-700 text-sm'>Loading document...</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* PDF Viewer replaces iframe */}
                                <div className='relative h-full min-h-0 w-full'>
                                    {typeof pdfBase64 === 'string' && pdfBase64 ? (
                                        <iframe
                                            src={
                                                pdfBase64.startsWith('data:') || pdfBase64.startsWith('http')
                                                    ? pdfBase64
                                                    : `data:application/pdf;base64,${pdfBase64}`
                                            }
                                            title='Pre Admission Application Form'
                                            className='h-full min-h-0 w-full border-0'
                                            style={{ display: iframeLoading ? 'none' : 'block' }}
                                            onLoad={() => setIframeLoading(false)}
                                        />
                                    ) : (
                                        <div className='flex h-full items-center justify-center'>
                                            <div className='text-gray-500 text-sm'>No document available</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Payment Dialog */}
                {selectedPaymentStudent && (
                    <AdaptiveDialog
                        title='Application Form Payment'
                        isOpen={isPaymentDialogOpen}
                        onClose={closePaymentDialog}
                        size='xl'
                        interactOutside={false}>
                        <AdaptiveBody className='flex flex-col gap-6'>
                            {isPaymentLoading ? (
                                <div className='flex flex-col items-center justify-center gap-4 py-12'>
                                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                                    <p className='text-muted-foreground text-sm'>Initializing payment...</p>
                                </div>
                            ) : paymentData ? (
                                <>
                                    {/* Payment Header */}
                                    <div className='rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6'>
                                        <div className='mb-4 flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <div className='rounded-full bg-primary/10 p-3'>
                                                    <CreditCard className='h-6 w-6 text-primary' />
                                                </div>
                                                <div>
                                                    <h3 className='font-bold text-lg'>Payment Details</h3>
                                                    <p className='text-muted-foreground text-sm'>Complete your application fee payment</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount Display */}
                                        <div className='mt-4 border-t pt-4'>
                                            <div className='flex items-baseline gap-2'>
                                                <span className='text-muted-foreground text-sm'>Amount to Pay:</span>
                                                <span className='font-bold text-3xl text-primary'>
                                                    ₹{Number(paymentData.amount || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Info */}
                                    <div className='rounded-lg border bg-card p-6'>
                                        <h4 className='mb-4 font-bold text-base'>Transaction Information</h4>
                                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                            <div className='flex items-start gap-3'>
                                                <div className='mt-0.5 rounded-md bg-muted p-2'>
                                                    <Hash className='h-4 w-4 text-muted-foreground' />
                                                </div>
                                                <div className='min-w-0 flex-1'>
                                                    <p className='mb-1 text-muted-foreground text-xs'>Transaction ID</p>
                                                    <p className='break-all font-mono text-sm'>{paymentData.transaction_id || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className='flex items-start gap-3'>
                                                <div className='mt-0.5 rounded-md bg-muted p-2'>
                                                    <User className='h-4 w-4 text-muted-foreground' />
                                                </div>
                                                <div className='min-w-0 flex-1'>
                                                    <p className='mb-1 text-muted-foreground text-xs'>Name</p>
                                                    <p className='break-words text-sm'>
                                                        {paymentData.customer_name || selectedPaymentStudent.student_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='flex items-start gap-3'>
                                                <div className='mt-0.5 rounded-md bg-muted p-2'>
                                                    <Mail className='h-4 w-4 text-muted-foreground' />
                                                </div>
                                                <div className='min-w-0 flex-1'>
                                                    <p className='mb-1 text-muted-foreground text-xs'>Email</p>
                                                    <p className='break-all text-sm'>
                                                        {paymentData.customer_email || selectedPaymentStudent.email_id}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className='flex items-start gap-3'>
                                                <div className='mt-0.5 rounded-md bg-muted p-2'>
                                                    <Phone className='h-4 w-4 text-muted-foreground' />
                                                </div>
                                                <div className='min-w-0 flex-1'>
                                                    <p className='mb-1 text-muted-foreground text-xs'>Phone</p>
                                                    <p className='text-sm'>
                                                        {paymentData.customer_phone || selectedPaymentStudent.mobile_no}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Note */}
                                    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20'>
                                        <div className='flex gap-3'>
                                            <svg
                                                className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                                                />
                                            </svg>
                                            <div className='flex-1'>
                                                <h5 className='mb-1 font-medium text-blue-900 text-sm dark:text-blue-100'>
                                                    Secure Payment
                                                </h5>
                                                <p className='text-blue-700 text-xs dark:text-blue-300'>
                                                    You will be redirected to Easebuzz payment gateway to complete your transaction
                                                    securely.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className='flex flex-col justify-end gap-3 pt-2 sm:flex-row'>
                                        <Button
                                            type='button'
                                            onClick={closePaymentDialog}
                                            disabled={isPaymentProcessing}
                                            className='w-fit rounded-md border border-input px-6 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50'>
                                            Cancel
                                        </Button>
                                        <Button
                                            type='button'
                                            onClick={handlePayNow}
                                            disabled={isPaymentProcessing}
                                            className='flex w-fit items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'>
                                            {isPaymentProcessing ? (
                                                <>
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                    Redirecting to Payment Gateway...
                                                </>
                                            ) : (
                                                <>
                                                    <IndianRupee className='h-4 w-4' />
                                                    Proceed to Pay
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Hidden form container */}
                                    <div ref={formContainerRef} className='hidden' />
                                </>
                            ) : (
                                <div className='flex flex-col items-center justify-center gap-4 py-12'>
                                    <p className='text-muted-foreground'>Unable to load payment details</p>
                                </div>
                            )}
                        </AdaptiveBody>
                    </AdaptiveDialog>
                )}
            </div>
        </div>
    );
}
