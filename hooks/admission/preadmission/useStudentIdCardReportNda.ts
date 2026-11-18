'use client';

import {
    getIdCardReport,
    onChangeClass,
    onChangeSection,
    onChangeYear,
    onLoadIdCardDetails
} from '@/server/admission/preadmission/reports/student_id_card_report_nda';
import { useMutation, useQuery } from '@tanstack/react-query';

export const idCardKeys = {
    all: ['student-id-card-report-nda'] as const,
    initial: () => [...idCardKeys.all, 'initial'] as const
};

/**
 * Hook to fetch initial data for Student ID Cards
 */
export function useIdCardInitialData() {
    return useQuery({
        queryKey: idCardKeys.initial(),
        queryFn: () => onLoadIdCardDetails(),
        staleTime: 5 * 60 * 1000
    });
}

/**
 * Hook to fetch class list when year is changed
 */
export function useIdCardClasses() {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number }) => onChangeYear(data)
    });
}

/**
 * Hook to fetch section list when class is changed
 */
export function useIdCardSections() {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number }) => onChangeClass(data)
    });
}

/**
 * Hook to fetch student list when section is changed
 */
export function useIdCardStudents() {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; ASMCL_Id: number; ASMS_Id: number }) => onChangeSection(data)
    });
}

/**
 * Hook to fetch individual student report for ID card printing
 */
export function useIdCardReport() {
    return useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMS_Id: number;
            StudentTempList: any[];
        }) => getIdCardReport(data)
    });
}
