import { COLLEGE_QUERY_KEYS } from '@/constants/query-keys';
import {
    changeBranchDCPSBonafide,
    changeCourseDCPSBonafide,
    changeSemesterDCPSBonafide,
    changeYearDCPSBonafide,
    getDCPSBonafideLoadData,
    getDCPSBonafideReport,
    searchDCPSBonafideStudents
} from '@/server/college/CollegeAdmission/Reports/dcps-bonafide-certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useDCPSBonafideLoadData = () => {
    return useQuery({
        queryKey: [COLLEGE_QUERY_KEYS.DCPS_BONAFIDE_CERTIFICATE, 'load_data'],
        queryFn: async () => await getDCPSBonafideLoadData(),
        staleTime: 0
    });
};

export const useDCPSBonafideYearChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number }) => await changeYearDCPSBonafide(data)
    });
};

export const useDCPSBonafideCourseChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number }) => await changeCourseDCPSBonafide(data)
    });
};

export const useDCPSBonafideBranchChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => await changeBranchDCPSBonafide(data)
    });
};

export const useDCPSBonafideSemesterChange = () => {
    return useMutation({
        mutationFn: async (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) =>
            await changeSemesterDCPSBonafide(data)
    });
};

export const useDCPSBonafideSearchFilter = () => {
    return useMutation({
        mutationFn: async (data: {
            filterinitialdata: string;
            searchfilter: string;
            ASMAY_Id: number;
            AMCST_SOL: string;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id: number;
            allorindid: string;
        }) => await searchDCPSBonafideStudents(data)
    });
};

export const useDCPSBonafideReport = () => {
    return useMutation({
        mutationFn: async (data: {
            ASMAY_Id: number;
            AMCST_SOL: string;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id: number;
            AMCST_Id: number;
            allorindid: string;
        }) => await getDCPSBonafideReport(data)
    });
};
