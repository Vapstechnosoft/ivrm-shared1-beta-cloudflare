'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    changeBranchDanvantariBonafide,
    changeCourseDanvantariBonafide,
    changeSemesterDanvantariBonafide,
    changeYearDanvantariBonafide,
    getDanvantariBonafideLoadData,
    getDanvantariBonafideReport,
    getDanvantariBonafideSearchFilter
} from '@/server/admission/preadmission/reports/danvantari_bonafide_certificate';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useDanvantariBonafideLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'danvantari_bonafide', 'load_data'],
        queryFn: () => getDanvantariBonafideLoadData()
    });
};

export const useChangeYearDanvantariBonafide = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => changeYearDanvantariBonafide(data)
    });
};

export const useChangeCourseDanvantariBonafide = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number }) => changeCourseDanvantariBonafide(data)
    });
};

export const useChangeBranchDanvantariBonafide = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number }) => changeBranchDanvantariBonafide(data)
    });
};

export const useChangeSemesterDanvantariBonafide = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMCO_Id: number; AMB_Id: number; AMSE_Id: number }) => changeSemesterDanvantariBonafide(data)
    });
};

export const useDanvantariBonafideSearchFilter = () => {
    return useMutation({
        mutationFn: (data: any) => getDanvantariBonafideSearchFilter(data)
    });
};

export const useDanvantariBonafideReport = () => {
    return useMutation({
        mutationFn: (data: any) => getDanvantariBonafideReport(data)
    });
};
