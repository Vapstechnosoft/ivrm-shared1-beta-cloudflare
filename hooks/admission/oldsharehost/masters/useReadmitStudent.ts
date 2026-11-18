import {
    getNewJoinList,
    getReadmitStudentDetails,
    getStudentListByYearAndClass,
    saveReadmitStudent
} from '@/server/admission/oldsharehost/masters/readmitstudent';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useReadmitStudentDetails = () => {
    return useQuery({
        queryKey: ['readmitStudentDetails'],
        queryFn: () => getReadmitStudentDetails()
    });
};

export const useStudentListByYearAndClass = () => {
    return useMutation({
        mutationFn: (data: any) => getStudentListByYearAndClass(data)
    });
};

export const useNewJoinList = () => {
    return useMutation({
        mutationFn: (data: any) => getNewJoinList(data)
    });
};

export const useSaveReadmitStudent = () => {
    return useMutation({
        mutationFn: (data: any) => saveReadmitStudent(data)
    });
};
