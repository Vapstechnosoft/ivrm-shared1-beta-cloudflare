'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { ArrowUpDown, Eye, Loader2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { IClgGradeDetailRecord } from '../types';

interface ViewGradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    gradeName: string;
    records: IClgGradeDetailRecord[];
    isLoading?: boolean;
}

type SortField = 'emgD_Name' | 'emgD_From' | 'emgD_To' | 'emgD_GradePoints' | 'emgD_Remarks';

export function ViewGradeModal({
    isOpen,
    onClose,
    gradeName,
    records,
    isLoading = false
}: ViewGradeModalProps) {
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortAsc, setSortAsc] = useState<boolean>(true);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(true);
        }
    };

    const sortedRecords = useMemo(() => {
        if (!sortField) return records;
        return [...records].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortAsc ? valA - valB : valB - valA;
            }
            const strA = String(valA ?? '').toLowerCase();
            const strB = String(valB ?? '').toLowerCase();
            return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
    }, [records, sortField, sortAsc]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-3xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
                        <Eye className='h-5 w-5 text-primary' />
                        <span>"{gradeName || 'Master'}" Grade Details</span>
                    </DialogTitle>
                </DialogHeader>

                <div className='max-h-[60vh] overflow-y-auto rounded-md border'>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center p-8 text-muted-foreground'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            <p className='mt-2 text-sm'>Loading details...</p>
                        </div>
                    ) : sortedRecords.length === 0 ? (
                        <div className='p-8 text-center text-sm text-muted-foreground'>
                            No grade details available.
                        </div>
                    ) : (
                        <table className='w-full border-collapse text-sm'>
                            <thead className='bg-muted/60 sticky top-0 border-b font-medium text-muted-foreground'>
                                <tr>
                                    <th className='p-3 text-center w-14'>SL NO</th>
                                    <th
                                        className='p-3 text-left cursor-pointer hover:text-foreground select-none'
                                        onClick={() => handleSort('emgD_Name')}>
                                        <div className='flex items-center gap-1'>
                                            <span>Grade</span>
                                            <ArrowUpDown className='h-3.5 w-3.5' />
                                        </div>
                                    </th>
                                    <th
                                        className='p-3 text-center cursor-pointer hover:text-foreground select-none'
                                        onClick={() => handleSort('emgD_From')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>From</span>
                                            <ArrowUpDown className='h-3.5 w-3.5' />
                                        </div>
                                    </th>
                                    <th
                                        className='p-3 text-center cursor-pointer hover:text-foreground select-none'
                                        onClick={() => handleSort('emgD_To')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>To</span>
                                            <ArrowUpDown className='h-3.5 w-3.5' />
                                        </div>
                                    </th>
                                    <th
                                        className='p-3 text-center cursor-pointer hover:text-foreground select-none'
                                        onClick={() => handleSort('emgD_GradePoints')}>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span>Grade Points</span>
                                            <ArrowUpDown className='h-3.5 w-3.5' />
                                        </div>
                                    </th>
                                    <th
                                        className='p-3 text-left cursor-pointer hover:text-foreground select-none'
                                        onClick={() => handleSort('emgD_Remarks')}>
                                        <div className='flex items-center gap-1'>
                                            <span>Remarks</span>
                                            <ArrowUpDown className='h-3.5 w-3.5' />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='divide-y'>
                                {sortedRecords.map((item, index) => (
                                    <tr key={index} className='hover:bg-muted/40 transition-colors'>
                                        <td className='p-3 text-center font-medium'>{index + 1}</td>
                                        <td className='p-3 text-left font-medium'>{item.emgD_Name}</td>
                                        <td className='p-3 text-center'>{item.emgD_From}</td>
                                        <td className='p-3 text-center'>{item.emgD_To}</td>
                                        <td className='p-3 text-center'>{item.emgD_GradePoints}</td>
                                        <td className='p-3 text-left text-muted-foreground'>{item.emgD_Remarks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <DialogFooter className='mt-2'>
                    <Button type='button' variant='outline' onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
