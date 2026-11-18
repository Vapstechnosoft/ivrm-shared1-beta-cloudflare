'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usebifurcationViewData } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { Loader2 } from 'lucide-react';
import type { IBifurcationConstraintList } from './columns';

interface ViewModalProps {
    rowData: IBifurcationConstraintList | IBifurcationConstraintList[];
    onClose: () => void;
}

export default function BifurcationViewModal({ rowData, onClose }: ViewModalProps) {
    const activeRow = Array.isArray(rowData) ? rowData[0] : rowData;
    const { data, isLoading } = usebifurcationViewData({ id: activeRow?.ttB_Id, enabled: true });

    // Some APIs return data directly in the response, others wrap it in a 'data' field.
    // We also handle OData-style $values and various property names.
    const responseData = data as any;
    const viewData =
        responseData?.viewdata ||
        responseData?.data?.viewdata ||
        responseData?.data?.$values ||
        (Array.isArray(responseData?.data) ? responseData.data : []) ||
        [];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Bifurcation Constraint Details</DialogTitle>
                    <DialogDescription>
                        View mapping details for: <span className='font-bold text-purple-700'>{activeRow?.bifricationName}</span>
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex h-40 items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                    </div>
                ) : (
                    <div className='mt-4'>
                        <Table className='rounded-md border'>
                            <TableHeader className='bg-purple-50'>
                                <TableRow>
                                    <TableHead className='w-[60px]'>Sl.No</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Staff</TableHead>
                                    <TableHead>Subject</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewData.length > 0 ? (
                                    viewData.map((item: any, index: number) => (
                                        <TableRow key={index} className='hover:bg-gray-50/50'>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell className='font-medium'>
                                                {item.asmcL_ClassName || item.className || item.asmcL_ClassName}
                                            </TableCell>
                                            <TableCell>{item.asmC_SectionName || item.sectioname || item.asmC_SectionName}</TableCell>
                                            <TableCell>{item.staffname || item.staffName || item.hrmE_EmployeeName}</TableCell>
                                            <TableCell>{item.ismS_SubjectName || item.subjectname || item.ismS_SubjectName}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                                            No details found for this constraint.
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
