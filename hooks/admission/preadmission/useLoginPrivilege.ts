import {
    deleteAttPrivileges,
    getDataByTypeSelected,
    getEditData,
    getEmployeeData,
    getStaffWiseGrid,
    saveLoginPrivilege
} from '@/server/admission/preadmission/attendance-entry/login_privilege';
import type { ILoginPrivilegeDTO } from '@/types/admission/preadmission/login_privilege';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const QUERY_KEY = 'admission_login_privileges';

export const useLoginPrivileges = (
    params: { entryType: number; hrmeId: number; enabled?: boolean } = { entryType: 2, hrmeId: 0 }
) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [QUERY_KEY, params.entryType, params.hrmeId],
        queryFn: () => getStaffWiseGrid(params.entryType, params.hrmeId),
        staleTime: 0,
        enabled: params.enabled ?? false
    });

    const createMutation = useMutation({
        mutationFn: (data: ILoginPrivilegeDTO) => saveLoginPrivilege(data),
        onSuccess: (res) => {
            if (res.success) {
                toast.success(res.message);
                queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            } else {
                toast.error(res.message || 'Failed to save privilege');
            }
        },
        onError: () => toast.error('An error occurred while saving')
    });

    const deleteMutation = useMutation({
        mutationFn: ({ asaluC_Id, asalucS_Id }: { asaluC_Id: number; asalucS_Id: number }) => deleteAttPrivileges(asaluC_Id, asalucS_Id),
        onSuccess: (res: any) => {
            if (res.returnVal || res.success) {
                toast.success(res.message || 'Subject privilege deleted successfully');
                queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            } else {
                toast.error('Failed to delete privilege');
            }
        },
        onError: () => toast.error('Failed to delete privilege')
    });

    const searchMutation = useMutation({
        mutationFn: (data: any) => getDataByTypeSelected(data),
        onError: () => toast.error('Failed to fetch details')
    });

    const editMutation = useMutation({
        mutationFn: (data: { asalU_Id: number; asaluC_Id: number; asalucS_Id: number }) =>
            getEditData({
                ASALU_Id: data.asalU_Id,
                ASALUC_Id: data.asaluC_Id,
                ASALUCS_Id: data.asalucS_Id
            }),
        onError: () => toast.error('Failed to fetch edit data')
    });

    return {
        ...query,
        createPrivilege: createMutation.mutateAsync,
        deletePrivilege: deleteMutation.mutateAsync,
        fetchDataByType: searchMutation.mutateAsync,
        fetchEditData: editMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isSearching: searchMutation.isPending,
        isEditing: editMutation.isPending
    };
};

export const useGetLoginPrivilegeEmployees = () => {
    return useQuery({
        queryKey: [QUERY_KEY, 'employees'],
        queryFn: async () => {
            const res = await getEmployeeData({});
            // The API returns { success: true, data: { employeeList: [...] } } or legacy with $values
            const rawList = (res as any)?.data?.employeeList || (res as any)?.employeeList || [];
            if (rawList && typeof rawList === 'object' && '$values' in rawList) {
                return (rawList as any).$values;
            }
            return Array.isArray(rawList) ? rawList : [];
        },
        staleTime: 0
    });
};
