import {
    deactivateInvVendorPayment,
    getGRNDetail,
    getGRNList,
    getInvGRNItemDetails,
    getInvVendorPaymentGRNDetails,
    getInvVendorPaymentModelDetails,
    getPaymentModes,
    getSuppliers,
    loadVendorPayments,
    saveInvVendorPayment
} from '@/server/inventory/transactions/inv-vendor-payment';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInvVendorPayment = (searchParams?: any) => {
    const queryClient = useQueryClient();

    const vendorPaymentsQuery = useQuery({
        queryKey: ['inv-vendor-payments-list', searchParams],
        queryFn: () => loadVendorPayments(searchParams)
    });

    const paymentModesQuery = useQuery({
        queryKey: ['inv-payment-modes', searchParams],
        queryFn: () => getPaymentModes(searchParams),
        staleTime: 5 * 60 * 1000 // cache for 5 mins
    });

    const suppliersQuery = useQuery({
        queryKey: ['inv-suppliers-list', searchParams],
        queryFn: () => getSuppliers(searchParams),
        staleTime: 5 * 60 * 1000
    });

    const getGRNDetailsMutation = useMutation({
        mutationFn: ({ invmS_Id, invmgrN_Id }: { invmS_Id: number; invmgrN_Id?: number }) =>
            getInvVendorPaymentGRNDetails(invmS_Id, invmgrN_Id)
    });

    const getGRNListMutation = useMutation({
        mutationFn: getGRNList
    });

    const getGRNDetailMutation = useMutation({
        mutationFn: ({ invmS_Id, invmgrN_Id }: { invmS_Id: number; invmgrN_Id: number }) => getGRNDetail(invmS_Id, invmgrN_Id)
    });

    const saveMutation = useMutation({
        mutationFn: saveInvVendorPayment,
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: ['inv-vendor-payments-list'] });
            } else {
                toast.error(res.message);
            }
        },
        onError: (err: any) => {
            toast.error(err.message || 'An error occurred');
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateInvVendorPayment,
        onSuccess: (res: any) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: ['inv-vendor-payments-list'] });
            } else {
                toast.error(res.message);
            }
        }
    });

    const getModelDetailsMutation = useMutation({
        mutationFn: getInvVendorPaymentModelDetails
    });

    const getGRNItemDetailsMutation = useMutation({
        mutationFn: getInvGRNItemDetails
    });

    return {
        ...vendorPaymentsQuery,
        vendorPayments: vendorPaymentsQuery.data,
        isVendorPaymentsLoading: vendorPaymentsQuery.isLoading,
        paymentModes: paymentModesQuery.data?.data || [],
        suppliers: suppliersQuery.data?.data || [],
        isLoadDataLoading: paymentModesQuery.isLoading || suppliersQuery.isLoading,
        getGRNDetailsMutation,
        getGRNListMutation,
        saveMutation,
        deactivateMutation: deactivateMutation,
        getModelDetailsMutation,
        getGRNItemDetailsMutation,
        getGRNDetailMutation
    };
};
