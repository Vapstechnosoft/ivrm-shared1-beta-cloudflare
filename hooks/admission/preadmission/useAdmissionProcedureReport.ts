import {
    getAdmissionProcedureClass,
    getAdmissionProcedureInitialDetails,
    getAdmissionProcedureReport,
    viewAdmissionDetails
} from '@/server/admission/preadmission/reports/admission_procedure_report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAdmissionProcedureInitialDetails = () => {
    return useQuery({
        queryKey: ['admission-procedure-initial-details'],
        queryFn: () => getAdmissionProcedureInitialDetails()
    });
};

export const useAdmissionProcedureClass = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMC_Id: number }) => getAdmissionProcedureClass(data)
    });
};

export const useAdmissionProcedureReport = () => {
    return useMutation({
        mutationFn: (data: {
            type: number;
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            AMC_Id: number;
        }) => getAdmissionProcedureReport(data)
    });
};

export const useViewAdmissionDetails = () => {
    return useMutation({
        mutationFn: (data: { AMST_Id: number; ASMCL_Id: number; ASMAY_Id: number }) => viewAdmissionDetails(data)
    });
};
