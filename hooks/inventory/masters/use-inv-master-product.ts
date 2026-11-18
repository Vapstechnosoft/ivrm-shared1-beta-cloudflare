import {
    deactiveInvMasterProduct,
    deactiveInvMasterProductQty,
    deactiveInvMasterProductTax,
    getInvMasterItemList,
    getInvMasterProductItemList,
    getInvMasterProductList,
    getInvMasterProductLoadData,
    getInvMasterProductTax,
    getInvMasterTaxList,
    saveInvMasterProduct,
    saveInvMasterProductQty
} from '@/server/inventory/masters/inv-master-product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInvMasterProduct = (searchParams?: any, itemSearchParams?: any) => {
    const queryClient = useQueryClient();

    const { data: loadData, isLoading: isLoadDataLoading } = useQuery({
        queryKey: ['invMasterProductLoadData', searchParams ?? {}],
        queryFn: () => getInvMasterProductLoadData(searchParams),
        enabled: searchParams !== undefined
    });

    const { data: productItemData, isLoading: isProductItemLoading } = useQuery({
        queryKey: ['invMasterProductItemData', itemSearchParams ?? {}],
        queryFn: () => getInvMasterProductItemList(itemSearchParams),
        enabled: itemSearchParams !== undefined
    });

    const refreshAll = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['invMasterProductLoadData'] }),
            queryClient.invalidateQueries({ queryKey: ['invMasterProductItemData'] })
        ]);
    };

    const { data: productList, refetch: refetchProductList } = useQuery({
        queryKey: ['invMasterProductDropdownList'],
        queryFn: () => getInvMasterProductList(),
        enabled: false
    });

    const { data: itemList, refetch: refetchItemList } = useQuery({
        queryKey: ['invMasterItemDropdownList'],
        queryFn: () => getInvMasterItemList(),
        enabled: false
    });

    const saveProductMutation = useMutation({
        mutationFn: saveInvMasterProduct,
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message);
                refreshAll();
            } else {
                if (res.message?.toLowerCase().includes('duplicate')) {
                    toast.error('Record already exist');
                } else {
                    toast.error(res.message || 'Failed to save/update record');
                }
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error('An error occurred');
        }
    });

    const saveProductQtyMutation = useMutation({
        mutationFn: saveInvMasterProductQty,
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message);
                refreshAll();
            } else {
                if (res.message?.toLowerCase().includes('duplicate')) {
                    toast.error('Record already exist');
                } else {
                    toast.error(res.message || 'Failed to save/update record');
                }
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error('An error occurred');
        }
    });

    const deactiveProductMutation = useMutation({
        mutationFn: deactiveInvMasterProduct,
        onSuccess: (res: any, variables: any) => {
            if (res.returnval || res.success) {
                toast.success(variables.INVMP_ActiveFlg ? 'Deactivated successfully' : 'Activated successfully');
                refreshAll();
            } else {
                toast.error(res.message || 'Failed to update record status');
            }
        }
    });

    const deactiveProductQtyMutation = useMutation({
        mutationFn: deactiveInvMasterProductQty,
        onSuccess: (res: any, variables: any) => {
            if (res.returnval || res.success) {
                toast.success(variables.INVMPI_ActiveFlg ? 'Deactivated successfully' : 'Activated successfully');
                refreshAll();
            } else {
                toast.error(res.message || 'Failed to update record status');
            }
        }
    });

    // For fetching tax details of a product
    const getProductTaxMutation = useMutation({
        mutationFn: getInvMasterProductTax
    });

    const deactiveProductTaxMutation = useMutation({
        mutationFn: deactiveInvMasterProductTax,
        onSuccess: (res: any, variables: any) => {
            if (res.returnval === true) {
                const isActive = variables.INVMPT_ActiveFlg ?? variables.invmpT_ActiveFlg ?? variables.active;
                toast.success(
                    isActive
                        ? 'Deactivated successfully'
                        : isActive === false
                          ? 'Activated successfully'
                          : 'Record Status Updated Successfully'
                );
            } else {
                toast.error('Failed to update record status');
            }
        }
    });

    const getTaxListMutation = useMutation({
        mutationFn: getInvMasterTaxList
    });

    const getProductListMutation = useMutation({
        mutationFn: getInvMasterProductList
    });

    const getItemListMutation = useMutation({
        mutationFn: getInvMasterItemList
    });

    const getProductItemListMutation = useMutation({
        mutationFn: getInvMasterProductItemList
    });

    return {
        loadData,
        refreshAll,
        isLoadDataLoading,
        productItemData,
        isProductItemLoading,
        productList,
        refetchProductList,
        itemList,
        refetchItemList,
        saveProductMutation,
        saveProductQtyMutation,
        deactiveProductMutation,
        deactiveProductQtyMutation,
        getProductTaxMutation,
        deactiveProductTaxMutation,
        getTaxListMutation,
        getProductListMutation,
        getItemListMutation,
        getProductItemListMutation
    };
};
