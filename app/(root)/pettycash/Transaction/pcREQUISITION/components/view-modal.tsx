'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRequisitionViewData } from '@/hooks/pettycash/transaction/pcREQUISITION';
import { Loader2 } from 'lucide-react';

interface ViewModalProps {
    rowData: any;
    onClose: () => void;
}

export default function PcRequisitionViewModal({ rowData, onClose }: ViewModalProps) {
    const { data, isLoading } = useRequisitionViewData({
        id: rowData?.pcreqtN_Id,
        enabled: !!rowData?.pcreqtN_Id
    });

    // Handle API response safely
    const viewData = Array.isArray(data) ? data : (data?.data ?? data?.data?.$values ?? []);

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='font-bold text-purple-700 text-xl'>Requisition Details</DialogTitle>

                    <DialogDescription>
                        Requisition No: <span className='font-bold'>{rowData?.pcreqtN_RequisitionNo}</span>
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex h-40 items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                    </div>
                ) : (
                    <div className='mt-4 overflow-hidden rounded-md border'>
                        <Table>
                            <TableHeader className='bg-purple-50'>
                                <TableRow>
                                    <TableHead className=' text-center'>SL.No</TableHead>
                                    <TableHead>Particular</TableHead>
                                    <TableHead className='text-right'>Amount</TableHead>
                                    <TableHead>Remarks</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {viewData.length > 0 ? (
                                    viewData.map((item: any, index: number) => (
                                        <TableRow key={item.pcreqtndE_Id}>
                                            <TableCell className='text-center'>{index + 1}</TableCell>

                                            <TableCell>{item.pcmparT_ParticularName}</TableCell>

                                            <TableCell className='text-right font-semibold'>{item.pcreqtndeT_Amount}</TableCell>

                                            <TableCell>{item.pcreqtndeT_Remarks}</TableCell>
                                            <TableCell>{item.pcreqtndeT_ActiveFlg}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className='h-32 text-center text-muted-foreground'>
                                            No records found
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
