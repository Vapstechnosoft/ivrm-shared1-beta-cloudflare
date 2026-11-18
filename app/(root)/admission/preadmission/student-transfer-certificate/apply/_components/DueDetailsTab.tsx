'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye } from 'lucide-react';

interface DueDetailsTabProps {
    data: any;
    disabled?: boolean;
}

export const DueDetailsTab = ({ data, disabled }: DueDetailsTabProps) => {
    // Extract totals from data
    const feeDueAmount = data?.fee_Due_Amnt || 0;
    const libraryDueCount = data?.library_Due_Amnt || 0;
    const pdaDueAmount = data?.pdA_Due || 0;
    const storeDueAmount = 0; // Placeholder as not mapped yet

    return (
        <div className='fade-in slide-in-from-bottom-2 animate-in space-y-6 duration-500'>
            <div className='overflow-hidden rounded-md border bg-white shadow-sm'>
                <div className='bg-[#2b589f] px-4 py-2 font-bold text-sm text-white uppercase'>Due Details</div>

                <div className='grid grid-cols-1 gap-x-12 gap-y-6 p-6 lg:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-6'>
                        {/* Fee Due */}
                        <div className='flex items-end gap-2'>
                            <div className='grid flex-1 grid-cols-[160px_1fr] items-center gap-4'>
                                <Label className='text-right font-semibold text-indigo-900'>Fee Due :</Label>
                                <Input
                                    value={feeDueAmount}
                                    readOnly
                                    className='bg-gray-50 text-right font-bold font-mono text-red-600'
                                    disabled={disabled}
                                />
                            </div>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='h-9 min-w-[120px] bg-gray-200 px-2 font-bold text-xs hover:bg-gray-300'>
                                <Eye className='mr-1 h-3 w-3' /> FEE DETAILS
                            </Button>
                        </div>

                        {/* Store/Canteen Due */}
                        <div className='grid grid-cols-[160px_1fr] items-center gap-4 pr-[128px]'>
                            {' '}
                            {/* Padding to align with above input excluding button */}
                            <Label className='text-right font-semibold text-indigo-900'>Store/Canteen Due :</Label>
                            <Input value={storeDueAmount} readOnly className='bg-gray-50 text-right font-mono' disabled={disabled} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-6'>
                        {/* Library Due */}
                        <div className='flex items-end gap-2'>
                            <div className='grid flex-1 grid-cols-[160px_1fr] items-center gap-4'>
                                <Label className='text-right font-semibold text-indigo-900'>Library Due :</Label>
                                <Input
                                    value={libraryDueCount}
                                    readOnly
                                    className='bg-gray-50 text-right font-bold font-mono text-red-600'
                                    disabled={disabled}
                                />
                            </div>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='h-9 min-w-[160px] bg-gray-200 px-2 font-bold text-xs hover:bg-gray-300'>
                                <Eye className='mr-1 h-3 w-3' /> LIBRARY DUE DETAILS
                            </Button>
                        </div>

                        {/* PDA Due */}
                        <div className='flex items-end gap-2'>
                            <div className='grid flex-1 grid-cols-[160px_1fr] items-center gap-4'>
                                <Label className='text-right font-semibold text-indigo-900'>PDA Due :</Label>
                                <Input
                                    value={pdaDueAmount}
                                    readOnly
                                    className='bg-gray-50 text-right font-bold font-mono text-red-600'
                                    disabled={disabled}
                                />
                            </div>
                            <Button
                                variant='secondary'
                                size='sm'
                                className='h-9 min-w-[120px] bg-gray-200 px-2 font-bold text-xs hover:bg-gray-300'>
                                <Eye className='mr-1 h-3 w-3' /> VIEW PDA DUE
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
