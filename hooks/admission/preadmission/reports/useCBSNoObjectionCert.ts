import {
    getCBSNoObjectionAcademicYearChange,
    getCBSNoObjectionLoadData,
    getCBSNoObjectionSearchFilter,
    getCBSNoObjectionStudDetails,
    getCBSNoObjectionStudentStatusChange,
    saveCBSNoObjectionQRCode
} from '@/server/admission/preadmission/reports/cbs_no_objection_cert';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCBSNoObjectionLoadData = (pageId: number) => {
    return useQuery({
        queryKey: ['cbs-no-objection-load-data'],
        queryFn: () => getCBSNoObjectionLoadData()
    });
};

export const useCBSNoObjectionStudentStatusChange = () => {
    return useMutation({
        mutationFn: getCBSNoObjectionStudentStatusChange
    });
};

export const useCBSNoObjectionAcademicYearChange = () => {
    return useMutation({
        mutationFn: getCBSNoObjectionAcademicYearChange
    });
};

export const useCBSNoObjectionSearchFilter = () => {
    return useMutation({
        mutationFn: getCBSNoObjectionSearchFilter
    });
};

export const useCBSNoObjectionStudDetails = () => {
    return useMutation({
        mutationFn: getCBSNoObjectionStudDetails
    });
};

export const useSaveCBSNoObjectionQRCode = () => {
    return useMutation({
        mutationFn: saveCBSNoObjectionQRCode
    });
};
