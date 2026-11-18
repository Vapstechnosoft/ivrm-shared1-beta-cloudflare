'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { useInvMasterProduct } from '@/hooks/inventory/masters/use-inv-master-product';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ToggleProductFormProps {
    rowData: any;
    onClose: () => void;
}

export default function ToggleProductForm({ rowData, onClose }: ToggleProductFormProps) {
    const { deactiveProductMutation, deactiveProductQtyMutation } = useInvMasterProduct();

    // Determine if it's a product qty record or a main product record
    const isProductQty = 'invmpI_Id' in rowData;
    const mutation = isProductQty ? deactiveProductQtyMutation : deactiveProductMutation;
    const entityName = isProductQty ? rowData.invmI_ItemName : rowData.invmP_ProductName;
    const isActive = isProductQty ? rowData.invmpI_ActiveFlg : rowData.invmP_ActiveFlg;

    const {
        handleSubmit,
        formState: { isSubmitting }
    } = useForm({
        defaultValues: rowData
    });

    const onSubmit: SubmitHandler<any> = async () => {
        try {
            const payload = isProductQty
                ? {
                      INVMPI_Id: rowData.invmpI_Id || rowData.invmPI_Id || rowData.INVMPI_Id,
                      INVMPI_ActiveFlg: rowData.invmpI_ActiveFlg ?? rowData.INVMPI_ActiveFlg
                  }
                : {
                      INVMP_Id: rowData.invmP_Id || rowData.invmP_Id || rowData.INVMP_Id,
                      INVMP_ActiveFlg: rowData.invmP_ActiveFlg ?? rowData.INVMP_ActiveFlg
                  };

            mutation.mutate(payload, {
                onSuccess: (res: any) => {
                    if (res.returnval === true || res.success) {
                        onClose();
                    }
                },
                onError: () => {
                    // Mutation hook already handles error toast if configured, but we can add a fallback if needed.
                }
            });
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        }
    };

    return (
        <AdaptiveDialog title={`Toggle ${isProductQty ? 'Item Quantity' : 'Product'} Status`} isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <div className='space-y-3'>
                        <p className='text-sm text-warning-foreground'>
                            Are you sure you want to {isActive ? 'deactivate' : 'activate'} <strong>{entityName}</strong>?
                        </p>
                    </div>
                </AdaptiveBody>

                <AdaptiveFooter>
                    <Button variant='outline' onClick={onClose} type='button' disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        isLoading={mutation.isPending}
                        variant={isActive ? 'destructive' : 'default'}
                        className={isActive ? 'bg-orange-500 text-white hover:bg-orange-600' : ''}
                        loadingText={isActive ? 'Deactivating...' : 'Activating...'}>
                        {isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </AdaptiveFooter>
            </form>
        </AdaptiveDialog>
    );
}
