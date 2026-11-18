import { deactivateInvMasterCustomer, getInvMasterCustomer, saveInvMasterCustomer } from '@/server/inventory/masters/inv-master-customer';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const INV_MASTER_CUSTOMER_QUERY_KEY = 'INV_MASTER_CUSTOMER';

export function useInvMasterCustomer(searchParams?: ApiSearchparams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [INV_MASTER_CUSTOMER_QUERY_KEY, searchParams],
        queryFn: () => getInvMasterCustomer(searchParams)
    });

    const saveMutation = useMutation({
        mutationFn: saveInvMasterCustomer,
        onSuccess: (response) => {
            if (response.success) {
                toast.success(response.message || 'Record saved successfully');
                queryClient.invalidateQueries({ queryKey: [INV_MASTER_CUSTOMER_QUERY_KEY] });
            } else if (response.returnduplicatestatus === 'Duplicate') {
                toast.error('Record already exists');
            } else {
                toast.error(response.message || 'Failed to save record');
            }
        },
        onError: (error) => {
            toast.error('An error occurred while saving');
            console.error(error);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deactivateInvMasterCustomer,
        onSuccess: (response: any, variables: any) => {
            if (response.success || response.returnval) {
                const wasActive = variables?.wasActive ?? Boolean(variables?.invmC_ActiveFlg);
                const actionMsg = wasActive ? 'Deactivated successfully' : 'Activated successfully';

                const backendMsg = response?.message;
                const hasSpecificMessage =
                    backendMsg &&
                    (backendMsg.toLowerCase().includes('activat') || backendMsg.toLowerCase().includes('deactivat'));

                const message = hasSpecificMessage ? backendMsg : actionMsg;
                if (wasActive) {
                    toast.error(message);
                } else {
                    toast.success(message);
                }
                queryClient.invalidateQueries({ queryKey: [INV_MASTER_CUSTOMER_QUERY_KEY] });
            } else {
                toast.error(response?.message || 'Failed to update status');
            }
        },
        onError: (error: any) => {
            toast.error(error?.message || 'An error occurred while updating status');
            console.error(error);
        }
    });

    return {
        ...query,
        saveMutation,
        deleteMutation
    };
}
