'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deactivateItemTax, getItemTax } from '@/server/inventory/masters/inv-master-item';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ItemTaxDialogProps {
    item: any;
    onClose: () => void;
}

export default function ItemTaxDialog({ item, onClose }: ItemTaxDialogProps) {
    const [taxData, setTaxData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchItemTaxes = async () => {
        setLoading(true);
        const res = await getItemTax(item.invmI_Id);
        if (res.success) {
            const taxList = (res as any).get_itemTax;
            const normalizedData = Array.isArray(taxList) ? taxList : (taxList?.$values ?? []);
            setTaxData(normalizedData);
        } else {
            setTaxData([]);
            toast.error('Failed to fetch tax details');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (item) {
            fetchItemTaxes();
        }
    }, [item]);

    const handleToggleTax = async (taxRecord: any) => {
        try {
            const isTaxActive = Boolean(taxRecord.invmiT_ActiveFlg ?? taxRecord.invmit_activeflg ?? taxRecord.INVMIT_ActiveFlg);
            const res = await deactivateItemTax(taxRecord);
            if ((res as any).returnval || res.success) {
                if (isTaxActive) {
                    toast.error('Tax Deactivated Successfully');
                } else {
                    toast.success('Tax Activated Successfully');
                }
                fetchItemTaxes();
            } else {
                toast.error(res?.message || 'Failed to update tax status');
            }
        } catch (error) {
            toast.error('Error toggling tax status');
        }
    };

    return (
        <Dialog open={!!item} onOpenChange={onClose}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Tax Details - {item?.invmI_ItemName}</DialogTitle>
                </DialogHeader>
                <div className='py-4'>
                    {loading ? (
                        <p className='text-center text-muted-foreground'>Loading tax details...</p>
                    ) : taxData.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SL NO</TableHead>
                                    <TableHead>Tax Name</TableHead>
                                    <TableHead>Tax Alias</TableHead>
                                    <TableHead>Percentage</TableHead>
                                    <TableHead className='text-center'>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taxData.map((tax, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>{tax.invmT_TaxName}</TableCell>
                                        <TableCell>{tax.invmT_TaxAliasName}</TableCell>
                                        <TableCell>{tax.invmiT_TaxValue}%</TableCell>
                                        <TableCell className='text-center'>
                                            <Button
                                                variant={tax.invmiT_ActiveFlg ? 'destructive' : 'default'}
                                                size='sm'
                                                onClick={() => handleToggleTax(tax)}>
                                                {tax.invmiT_ActiveFlg ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className='text-center text-muted-foreground'>No tax details found for this item.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
