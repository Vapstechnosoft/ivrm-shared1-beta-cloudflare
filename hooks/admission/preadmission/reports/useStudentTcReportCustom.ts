import {
    getStudentTcACS,
    getStudentTcDetails,
    getStudentTcInitialData,
    getStudentTcStudentList
} from '@/server/admission/preadmission/reports/student_tc_report_custom';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useStudentTcInitialData = () => {
    return useQuery({
        queryKey: ['studentTcInitialData'],
        queryFn: async () => {
            return await getStudentTcInitialData();
        }
    });
};

export const useStudentTcStudentList = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            ASMCL_Id?: number;
            ASMC_Id?: number;
        }) => {
            return await getStudentTcStudentList(data);
        }
    });
};

export const useStudentTcDetails = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMST_Id: number;
        }) => {
            return await getStudentTcDetails(data);
        }
    });
};

export const useStudentTcACS = () => {
    return useMutation({
        mutationFn: async (yearId: number) => {
            return await getStudentTcACS(yearId);
        }
    });
};
