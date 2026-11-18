'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    getHostelFoodConveyanceReport,
    getHostelFoodConveyanceReportInitialDetails
} from '@/server/admission/oldsharehost/reports/hostel_food_conveyance_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useHostelFoodConveyanceReportInitialDetails = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'hostel_food_conveyance_report_initial_details'],
        queryFn: getHostelFoodConveyanceReportInitialDetails
    });
};

export const useHostelFoodConveyanceReport = () => {
    return useMutation({
        mutationFn: (payload: any) => getHostelFoodConveyanceReport(payload)
    });
};
