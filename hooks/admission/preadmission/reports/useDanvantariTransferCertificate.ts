'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    changeBranchDanvantariTC,
    changeCourseDanvantariTC,
    changeSemesterDanvantariTC,
    changeYearDanvantariTC,
    getDanvantariStudentName,
    getDanvantariTCDetails,
    getDanvantariTCLoadData
} from '@/server/admission/preadmission/reports/danvantari_transfer_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useDanvantariTCLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'danvantari_tc', 'load_data'],
        queryFn: () => getDanvantariTCLoadData()
    });
};

export const useChangeYearDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; tctemporper: string }) => changeYearDanvantariTC(data)
    });
};

export const useChangeCourseDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; tctemporper: string }) => changeCourseDanvantariTC(data)
    });
};

export const useChangeBranchDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; tctemporper: string }) => changeBranchDanvantariTC(data)
    });
};

export const useChangeSemesterDanvantariTC = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number; tctemporper: string }) =>
            changeSemesterDanvantariTC(data)
    });
};

export const useDanvantariStudentName = () => {
    return useMutation({
        mutationFn: (data: { AMCO_Id: number; ASMAY_Id: number; AMB_Id: number; searchfilter: string; AMCST_SOL: string }) =>
            getDanvantariStudentName(data)
    });
};

export const useDanvantariTCDetails = () => {
    return useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            AMCST_Id: number;
            AMCO_Id: number;
            AMB_Id: number;
            AMSE_Id: number;
            ACMS_Id: number;
            miId: number;
            admNo: string;
            studentName: string;
            tctemporper: string;
        }) => getDanvantariTCDetails(data)
    });
};
