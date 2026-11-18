import {
    getInvRSalesClassData,
    getInvRSalesDetails,
    getInvRSalesItemLoadData,
    getInvRSalesLoadData,
    getInvRSalesReport,
    getInvRSalesStaffLoadData,
    getInvRSalesStudentList
} from '@/server/inventory/reports/inv-r-sales';
import type { IInvRSalesPayload } from '@/types/inventory/reports/inv-r-sales';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useInvRSalesLoadData = () => {
    return useQuery({
        queryKey: ['invRSalesLoadData'],
        queryFn: getInvRSalesLoadData
    });
};

export const useInvRSalesItemLoadData = (optionflag: string) => {
    return useQuery({
        queryKey: ['invRSalesItemLoadData', optionflag],
        queryFn: () => getInvRSalesItemLoadData(optionflag),
        enabled: !!optionflag
    });
};

export const useInvRSalesStaffLoadData = (enabled: boolean) => {
    return useQuery({
        queryKey: ['invRSalesStaffLoadData'],
        queryFn: getInvRSalesStaffLoadData,
        enabled
    });
};

export const useInvRSalesDetails = (optionflag: string | undefined, typeflag?: string) => {
    return useQuery({
        queryKey: ['invRSalesDetails', optionflag, typeflag],
        queryFn: () => getInvRSalesDetails(optionflag!, typeflag),
        enabled: !!optionflag
    });
};

export const useInvRSalesClassData = (individualflag: string | undefined) => {
    return useQuery({
        queryKey: ['invRSalesClassData', individualflag],
        queryFn: () => getInvRSalesClassData(individualflag!),
        enabled: !!individualflag && (individualflag === 'C' || individualflag === 'CS')
    });
};

export const useInvRSalesSectionList = (asmcL_Id: string | undefined, individualflag: string | undefined) => {
    return useQuery({
        queryKey: ['invRSalesSectionList', asmcL_Id],
        queryFn: () => getInvRSalesStudentList({ ASMCL_Id: Number(asmcL_Id), ASMS_Id: 0, type: 'CS' }),
        enabled: !!asmcL_Id && individualflag === 'CS'
    });
};

export const useInvRSalesStudentList = (
    asmcL_Id: string | undefined,
    asmS_Id: string | undefined,
    individualflag: string | undefined,
    optionflag: string | undefined
) => {
    return useQuery({
        queryKey: ['invRSalesStudentList', asmcL_Id, asmS_Id, individualflag, optionflag],
        queryFn: () => {
            const payload = {
                ASMCL_Id: asmcL_Id ? Number(asmcL_Id) : 0,
                ASMS_Id: asmS_Id ? Number(asmS_Id) : 0,
                type: 'C'
            };
            return getInvRSalesStudentList(payload);
        },
        enabled:
            optionflag === 'Student' && ((individualflag === 'C' && !!asmcL_Id) || (individualflag === 'CS' && !!asmcL_Id && !!asmS_Id))
    });
};

export const useInvRSalesReport = () => {
    return useMutation({
        mutationFn: (payload: IInvRSalesPayload) => getInvRSalesReport(payload),
        onSuccess: (data) => {
            if (data.success) {
                toast.success('Report generated successfully');
            } else {
                toast.error(data.message || 'Failed to generate report');
            }
        },
        onError: (error) => {
            toast.error('An error occurred while generating the report');
            console.error(error);
        }
    });
};

export const useInvRSalesReportQuery = (payload: IInvRSalesPayload | null, searchParams: any) => {
    return useQuery({
        queryKey: ['invRSalesReport', payload, searchParams],
        queryFn: () => {
            if (!payload) return { success: true, data: { get_SalesReport: [] }, total: 0, message: '', page: 1, page_size: 10 };
            return getInvRSalesReport(payload, searchParams);
        },
        enabled: !!payload
    });
};
