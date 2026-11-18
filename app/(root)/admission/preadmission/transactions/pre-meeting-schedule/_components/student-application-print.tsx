'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getStudentPrintData } from '@/server/admission/preadmission/transactions/application_form';
import type { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import { Printer } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface StudentApplicationPrintProps {
    isOpen: boolean;
    onClose: () => void;
    record: IPreMeetingSchedule | null;
}

export default function StudentApplicationPrint({ isOpen, onClose, record }: StudentApplicationPrintProps) {
    const [printData, setPrintData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Student_Application_${record?.studentname || 'Details'}`
    });

    useEffect(() => {
        if (isOpen && record) {
            const fetchPrintData = async () => {
                setIsLoading(true);
                try {
                    // Assuming ASMCL_Id, ASMAY_Id, ASMST_Id are retrieved or passed differently.
                    // For now, passing 0 or mock ids as the legacy code just sent pasR_Id for this specific API.
                    // If the backend requires them, we might need to fetch them from the record if available.
                    const res = await getStudentPrintData(record.pasr_id, 0, 0, 0);
                    const dtObj = res?.studentReg_DTObj as any[];
                    if (dtObj && dtObj.length > 0) {
                        setPrintData(dtObj[0]);
                    }
                } catch (error) {
                    console.error('Error fetching print data:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPrintData();
        } else {
            setPrintData(null);
        }
    }, [isOpen, record]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex h-[90vh] max-w-5xl flex-col p-0'>
                <DialogHeader className='sticky top-0 z-10 flex flex-row items-center justify-between border-b bg-white px-6 py-4'>
                    <DialogTitle className='font-bold text-blue-800 text-xl'>Application Details - {record?.studentname}</DialogTitle>
                    <div className='flex gap-2 pr-6'>
                        <Button onClick={() => handlePrint()} disabled={isLoading || !printData}>
                            <Printer className='mr-2 h-4 w-4' /> Print Application
                        </Button>
                    </div>
                </DialogHeader>

                <div className='flex-1 overflow-auto bg-slate-50 p-6'>
                    {isLoading ? (
                        <div className='flex h-full items-center justify-center'>
                            <span className='animate-pulse font-medium text-slate-500'>Loading Application Data...</span>
                        </div>
                    ) : !printData ? (
                        <div className='flex h-full items-center justify-center'>
                            <span className='text-slate-500'>No application data found.</span>
                        </div>
                    ) : (
                        <div
                            ref={printRef}
                            className='mx-auto min-h-[1056px] max-w-4xl border bg-white p-8 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none'>
                            {/* Generic Print Template mapped from printData */}
                            <div className='mb-8 border-b pb-4 text-center'>
                                <h1 className='font-bold text-2xl uppercase tracking-wide'>Student Application Form</h1>
                                <p className='mt-1 text-muted-foreground'>Registration No: {printData.pasR_RegistrationNo}</p>
                            </div>

                            <div className='mb-8 flex gap-8'>
                                <div className='flex h-40 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded border-2 border-slate-200 bg-slate-50'>
                                    {printData.pasR_Student_Pic_Path ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={printData.pasR_Student_Pic_Path} alt='Student' className='h-full w-full object-cover' />
                                    ) : (
                                        <span className='text-slate-400 text-xs'>Photo</span>
                                    )}
                                </div>
                                <div className='grid flex-1 grid-cols-2 gap-x-8 gap-y-4 text-sm'>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>First Name</span>
                                        <span className='text-slate-900 uppercase'>{printData.pasR_FirstName || '-'}</span>
                                    </div>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>Last Name</span>
                                        <span className='text-slate-900 uppercase'>{printData.pasR_LastName || '-'}</span>
                                    </div>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>Date of Birth</span>
                                        <span className='text-slate-900'>
                                            {printData.pasR_DOB ? new Date(printData.pasR_DOB).toLocaleDateString() : '-'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>Gender</span>
                                        <span className='text-slate-900 uppercase'>{printData.pasR_Sex || '-'}</span>
                                    </div>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>Blood Group</span>
                                        <span className='text-slate-900'>{printData.pasR_BloodGroup || '-'}</span>
                                    </div>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>Mother Tongue</span>
                                        <span className='text-slate-900'>{printData.pasR_MotherTongue || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-8'>
                                <h2 className='mb-4 rounded-t border-slate-200 border-b bg-slate-50 px-2 pb-2 font-bold text-lg'>
                                    Contact Information
                                </h2>
                                <div className='grid grid-cols-2 gap-x-8 gap-y-4 px-2 text-sm'>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>Mobile No</span>
                                        <span className='text-slate-900'>{printData.pasR_MobileNo || '-'}</span>
                                    </div>
                                    <div>
                                        <span className='block font-semibold text-slate-600'>Email ID</span>
                                        <span className='text-slate-900'>{printData.pasR_emailId || '-'}</span>
                                    </div>
                                    <div className='col-span-2'>
                                        <span className='block font-semibold text-slate-600'>Permanent Address</span>
                                        <span className='text-slate-900'>
                                            {[
                                                printData.pasR_PerStreet,
                                                printData.pasR_PerArea,
                                                printData.pasR_PerCity,
                                                printData.pasR_PerPincode
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-8'>
                                <h2 className='mb-4 rounded-t border-slate-200 border-b bg-slate-50 px-2 pb-2 font-bold text-lg'>
                                    Parents Information
                                </h2>
                                <div className='grid grid-cols-2 gap-x-8 gap-y-6 px-2 text-sm'>
                                    <div>
                                        <span className='mb-2 block border-b pb-1 font-semibold text-blue-800'>Father Details</span>
                                        <div className='space-y-2'>
                                            <div>
                                                <span className='text-slate-500'>Name:</span> {printData.pasR_FatherName || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Education:</span> {printData.pasR_FatherEducation || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Occupation:</span> {printData.pasR_FatherOccupation || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Mobile:</span> {printData.pasR_FatherMobleNo || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Email:</span> {printData.pasR_FatheremailId || '-'}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className='mb-2 block border-b pb-1 font-semibold text-blue-800'>Mother Details</span>
                                        <div className='space-y-2'>
                                            <div>
                                                <span className='text-slate-500'>Name:</span> {printData.pasR_MotherName || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Education:</span> {printData.pasR_MotherEducation || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Occupation:</span> {printData.pasR_MotherOccupation || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Mobile:</span> {printData.pasR_MotherMobleNo || '-'}
                                            </div>
                                            <div>
                                                <span className='text-slate-500'>Email:</span> {printData.pasR_MotheremailId || '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-16 flex justify-between border-slate-300 border-t pt-16 font-semibold text-sm'>
                                <div className='text-center'>
                                    <div className='mb-2 h-8 w-48 border-black border-b'></div>
                                    Parent/Guardian Signature
                                </div>
                                <div className='text-center'>
                                    <div className='mb-2 h-8 w-48 border-black border-b'></div>
                                    Principal Signature
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
