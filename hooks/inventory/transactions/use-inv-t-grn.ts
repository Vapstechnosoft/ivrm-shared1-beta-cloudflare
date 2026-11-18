import {
    deleteInvTGRN,
    getInvTGRNLoadData,
    loadGRNItems,
    loadGRNStores,
    loadGRNSuppliers,
    loadGRNTax,
    saveInvTGRNDetails,
    toggleInvTGRNActive
} from '@/server/inventory/transactions/inv-t-grn';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const INV_T_GRN_QUERY_KEY = 'INV_T_GRN';

export function useInvTGRN(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [INV_T_GRN_QUERY_KEY, searchParams],
        queryFn: async () => {
            console.log('useInvTGRN: Fetching data with params:', searchParams);
            const data = await getInvTGRNLoadData(searchParams);
            return data;
        },
        staleTime: 0
    });

    const suppliersQuery = useQuery({
        queryKey: ['INV_T_GRN_SUPPLIERS'],
        queryFn: async () => {
            const res = await loadGRNSuppliers();
            return res;
        },
        staleTime: 5 * 60 * 1000
    });

    const storesQuery = useQuery({
        queryKey: ['INV_T_GRN_STORES'],
        queryFn: async () => {
            const res = await loadGRNStores();
            return res;
        },
        staleTime: 5 * 60 * 1000
    });

    const itemsQuery = useQuery({
        queryKey: ['INV_T_GRN_ITEMS'],
        queryFn: async () => {
            const res = await loadGRNItems();
            return res;
        },
        staleTime: 5 * 60 * 1000
    });

    const taxQuery = useQuery({
        queryKey: ['INV_T_GRN_TAX'],
        queryFn: async () => {
            const res = await loadGRNTax();
            return res;
        },
        staleTime: 5 * 60 * 1000
    });

    const extractArray = (res: any, ...keys: string[]): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        for (const key of keys) {
            if (key && Array.isArray(res[key])) return res[key];
            if (key && Array.isArray(res.data?.[key])) return res.data[key];
        }
        if (Array.isArray(res.get_store)) return res.get_store;
        if (Array.isArray(res.data?.get_store)) return res.data.get_store;
        if (Array.isArray(res.get_Store)) return res.get_Store;
        if (Array.isArray(res.data?.get_Store)) return res.data.get_Store;
        if (Array.isArray(res.get_supplier)) return res.get_supplier;
        if (Array.isArray(res.data?.get_supplier)) return res.data.get_supplier;
        if (Array.isArray(res.get_item)) return res.get_item;
        if (Array.isArray(res.data?.get_item)) return res.data.get_item;
        if (Array.isArray(res.get_tax)) return res.get_tax;
        if (Array.isArray(res.data?.get_tax)) return res.data.get_tax;
        return [];
    };

    const suppliersList = extractArray(suppliersQuery.data, 'get_supplier');
    const storesList = extractArray(storesQuery.data, 'get_store', 'get_Store');
    const itemsList = extractArray(itemsQuery.data, 'get_item');
    const taxesList = extractArray(taxQuery.data, 'get_tax');

    const fallbackSuppliers = extractArray(query.data, 'get_supplier');
    const fallbackStores = extractArray(query.data, 'get_store', 'get_Store');
    const fallbackItems = extractArray(query.data, 'get_item');
    const fallbackTaxes = extractArray(query.data, 'get_tax');

    const suppliers = suppliersList.length > 0 ? suppliersList : fallbackSuppliers;
    const stores = storesList.length > 0 ? storesList : fallbackStores;
    const items = itemsList.length > 0 ? itemsList : fallbackItems;
    const taxes = taxesList.length > 0 ? taxesList : fallbackTaxes;

    const saveMutation = useMutation({
        mutationFn: saveInvTGRNDetails,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Record saved successfully');
                queryClient.invalidateQueries({ queryKey: [INV_T_GRN_QUERY_KEY] });
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        },
        onError: () => {
            toast.error('An error occurred while saving');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInvTGRN,
        onSuccess: (response: any) => {
            if (response.success || response.message === 'Success') {
                toast.success('Record deleted successfully');
                queryClient.invalidateQueries({ queryKey: [INV_T_GRN_QUERY_KEY] });
            } else {
                toast.error(response.message || 'Failed to delete record');
            }
        }
    });

    const toggleActiveMutation = useMutation({
        mutationFn: toggleInvTGRNActive,
        onSuccess: (response: any) => {
            if (response.success || response.returnval === true || (response.data && response.data.length > 0)) {
                toast.success('Status updated successfully');
                queryClient.invalidateQueries({ queryKey: [INV_T_GRN_QUERY_KEY] });
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        }
    });

    return {
        ...query,
        suppliers,
        stores,
        items,
        taxes,
        suppliersLoading: suppliersQuery.isLoading,
        storesLoading: storesQuery.isLoading,
        itemsLoading: itemsQuery.isLoading,
        saveMutation,
        deleteMutation,
        toggleActiveMutation,
        refetchDropdowns: () => {
            queryClient.invalidateQueries({ queryKey: ['INV_T_GRN_SUPPLIERS'] });
            queryClient.invalidateQueries({ queryKey: ['INV_T_GRN_STORES'] });
            queryClient.invalidateQueries({ queryKey: ['INV_T_GRN_ITEMS'] });
            queryClient.invalidateQueries({ queryKey: ['INV_T_GRN_TAX'] });
        }
    };
}
