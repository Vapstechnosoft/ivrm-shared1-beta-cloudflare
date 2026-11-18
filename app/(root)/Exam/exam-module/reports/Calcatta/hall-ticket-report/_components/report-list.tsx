'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const { datareport: mainList = [], accyear = '', examname = '', institute = [] } = data ?? {};

    // Get logo path from institute data or use default if available in the same way as angular
    const imgname = institute.length > 0 ? institute[0].mI_Logo : '';

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = useReactToPrint({
        contentRef: printRef
    });

    if (!mainList.length) {
        return (
            <Card>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='text-gray-500'>No records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    // ── Calcatta Admit Card Design ──────────────────────────────────────────
    const renderAdmitCard = () => (
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {mainList.map((user: any, idx: number) => {
                return (
                    <div
                        key={idx}
                        className='break-inside-avoid border border-black p-4'
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        <div className='mb-4 flex flex-col items-center'>
                            {imgname && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imgname} alt='School Logo' style={{ width: '370px', objectFit: 'contain' }} className='mb-2' />
                            )}
                            <h4 className='m-0 font-bold text-lg'>ADMIT CARD</h4>
                            <h4 className='m-0 font-bold text-md'>
                                {examname}-{accyear}
                            </h4>
                        </div>

                        <div className='space-y-2 text-sm'>
                            <p className='m-0'>
                                <b>This ADMIT CARD should be presented at each examination</b>
                            </p>
                            <p className='m-0'>
                                <b>Name : &emsp; {user.amsT_FirstName}</b>
                            </p>

                            <div className='flex justify-between'>
                                <div className='w-3/4'>
                                    <p className='m-0'>
                                        <b>Class & Section :</b>&emsp;{' '}
                                        <b>
                                            {user.asmcL_ClassName} - {user.asmC_SectionName}
                                        </b>
                                    </p>
                                </div>
                                <div className='w-1/4'>
                                    <p className='m-0'>
                                        <b>Roll No:&emsp;{user.amaY_Rollno}</b>
                                    </p>
                                </div>
                            </div>

                            <p className='m-0'>
                                <b>Scholar ID :&emsp;{user.amsT_AdmNo}</b>
                            </p>
                        </div>

                        <div className='mt-6 flex w-1/3 flex-col items-center'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src='https://calcuttaboy.blob.core.windows.net/files/SIGN - PRINCIPAL R MCGEE = darkened.jpg'
                                alt='Principal Signature'
                                style={{ width: '70px' }}
                                className='mb-[-8px]'
                            />
                            <p className='m-0 font-bold text-xs'>(Raja McGee)</p>
                            <p className='m-0 font-bold text-xs'>Principal&amp;Secretary</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Card className='mt-6'>
            {/* Toolbar */}
            <div className='no-print flex items-center justify-between border-b px-6 py-3'>
                <h3 className='font-semibold text-lg'>Hallticket Report</h3>
                <div className='flex gap-2'>
                    <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <CardContent className='p-6'>
                <div ref={printRef} className='print-container bg-white p-4'>
                    {/* Render the format (in the original html, both printformat1 and default used similar design) */}
                    {renderAdmitCard()}
                </div>
            </CardContent>
        </Card>
    );
};
