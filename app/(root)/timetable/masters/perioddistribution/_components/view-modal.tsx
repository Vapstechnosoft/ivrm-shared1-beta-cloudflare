'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePeriodDistributionViewData } from '@/hooks/timetable/useMasters';
import type { PeriodDistributionColumn, PeriodDistributionViewRecord } from '@/types/timetable/masters/masters';
import { Loader2 } from 'lucide-react';

interface ViewModalProps {
    rowData: PeriodDistributionColumn | null;
    onClose: () => void;
}

export default function PeriodDistributionViewModal({ rowData, onClose }: ViewModalProps) {
    const { data, isLoading } = usePeriodDistributionViewData({
        id: rowData?.ttfpD_Id,
        enabled: !!rowData?.ttfpD_Id
    });

    // Handle the API response structure. The user provided an array directly in "data" field of their sample.
    const viewData: PeriodDistributionViewRecord[] = (data as any)?.data || [];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='max-h-[80vh] max-w-5xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-2xl text-purple-700'>Period Distribution Details</DialogTitle>
                    <DialogDescription>
                        Detailed breakdown for Academic Year: <span className='font-bold'>{rowData?.asmaY_Year}</span>
                        {rowData?.staffName && (
                            <>
                                {' '}
                                - Staff: <span className='font-bold'>{rowData.staffName}</span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex h-40 items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                    </div>
                ) : (
                    <div className='mt-4 overflow-hidden rounded-xl border border-purple-100 shadow-sm'>
                        <Table>
                            <TableHeader className='bg-purple-50/50'>
                                <TableRow>
                                    <TableHead className='w-[60px] font-bold text-purple-900'>Sl.No</TableHead>
                                    <TableHead className='font-bold text-purple-900'>Category</TableHead>
                                    <TableHead className='font-bold text-purple-900'>Class</TableHead>
                                    <TableHead className='font-bold text-purple-900'>Section</TableHead>
                                    <TableHead className='font-bold text-purple-900'>Subject</TableHead>
                                    <TableHead className='font-bold text-purple-900'>Periods</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewData.length > 0 ? (
                                    viewData.map((item, index) => (
                                        <TableRow key={item.ttfpdD_Id} className='transition-colors hover:bg-purple-50/30'>
                                            <TableCell className='font-medium'>{index + 1}</TableCell>
                                            <TableCell>{item.ttmC_CategoryName}</TableCell>
                                            <TableCell>{item.asmcL_ClassName}</TableCell>
                                            <TableCell>{item.asmC_SectionName}</TableCell>
                                            <TableCell>{item.ismS_SubjectName}</TableCell>
                                            <TableCell className='font-bold text-purple-700'>{item.ttfpD_TotalPeriods}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className='h-32 text-center text-muted-foreground'>
                                            <div className='flex flex-col items-center gap-2'>
                                                <p>No distribution records found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
