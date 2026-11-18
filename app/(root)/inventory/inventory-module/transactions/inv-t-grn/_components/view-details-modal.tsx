'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { getInvTGRNItemDetails } from '@/server/inventory/transactions/inv-t-grn';
import type { IInvTGRN, IInvTGRNItem } from '@/types/inventory/transactions/inv-t-grn';
import { useEffect, useState } from 'react';

interface ViewGRNDetailsModalProps {
    rowData: IInvTGRN;
    isOpen: boolean;
    onClose: () => void;
}

export default function ViewGRNDetailsModal({ rowData, isOpen, onClose }: ViewGRNDetailsModalProps) {
    const [details, setDetails] = useState<IInvTGRNItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            if (isOpen && rowData.invmgrN_Id) {
                setIsLoading(true);
                try {
                    const res = await getInvTGRNItemDetails(rowData.invmgrN_Id);
                    if (res.success && res.data) {
                        setDetails(res.data || []);
                    }
                } catch (error) {
                    console.error('Error fetching GRN details:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        }
        fetchDetails();
    }, [isOpen, rowData.invmgrN_Id]);

    return (
        <AdaptiveDialog isOpen={isOpen} onClose={onClose} title={`GRN Details - ${rowData.invmgrN_GRNNo}`} size='4xl'>
            <AdaptiveBody className='p-6'>
                <div className='mb-6 grid grid-cols-2 gap-4 rounded-lg bg-muted/30 p-4 lg:grid-cols-4'>
                    <div>
                        <p className='font-semibold text-muted-foreground text-xs uppercase'>Store</p>
                        <p className='font-medium text-sm'>{rowData.invmS_StoreName}</p>
                    </div>
                    <div>
                        <p className='font-semibold text-muted-foreground text-xs uppercase'>Supplier</p>
                        <p className='font-medium text-sm'>{rowData.invmS_SupplierName}</p>
                    </div>
                    <div>
                        <p className='font-semibold text-muted-foreground text-xs uppercase'>Date</p>
                        <p className='font-medium text-sm'>
                            {rowData.invmgrN_PurchaseDate ? new Date(rowData.invmgrN_PurchaseDate).toLocaleDateString() : '-'}
                        </p>
                    </div>
                    <div>
                        <p className='font-semibold text-muted-foreground text-xs uppercase'>Total Value</p>
                        <p className='font-bold text-primary text-sm'>₹{Number(rowData.invmgrN_PurchaseValue).toFixed(2)}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className='flex justify-center p-8'>Loading item details...</div>
                ) : (
                    <div className='overflow-hidden rounded-lg border'>
                        <table className='w-full text-sm'>
                            <thead className='bg-muted'>
                                <tr>
                                    <th className='border p-2 text-left'>SL</th>
                                    <th className='border p-2 text-left'>Item</th>
                                    <th className='border p-2 text-left'>UOM</th>
                                    <th className='border p-2 text-center'>Batch</th>
                                    <th className='border p-2 text-right'>Qty</th>
                                    <th className='border p-2 text-right'>Rate</th>
                                    <th className='border p-2 text-right'>Discount</th>
                                    <th className='border p-2 text-right'>Tax</th>
                                    <th className='border p-2 text-right'>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((item, index) => (
                                    <tr key={index} className='hover:bg-muted/30'>
                                        <td className='border p-2 text-center'>{index + 1}</td>
                                        <td className='border p-2'>{item.invmI_ItemName}</td>
                                        <td className='border p-2'>{item.invmuoM_UOMName}</td>
                                        <td className='border p-2 text-center'>{item.invtgrN_BatchNo}</td>
                                        <td className='border p-2 text-right'>{item.invtgrN_Qty}</td>
                                        <td className='border p-2 text-right'>₹{Number(item.invtgrN_PurchaseRate).toFixed(2)}</td>
                                        <td className='border p-2 text-right'>₹{Number(item.invtgrN_DiscountAmt).toFixed(2)}</td>
                                        <td className='border p-2 text-right'>₹{Number(item.invtgrN_TaxAmt).toFixed(2)}</td>
                                        <td className='border p-2 text-right font-medium'>₹{Number(item.invtgrN_Amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button onClick={onClose} variant='secondary'>
                    Close
                </Button>
            </AdaptiveFooter>
        </AdaptiveDialog>
    );
}
