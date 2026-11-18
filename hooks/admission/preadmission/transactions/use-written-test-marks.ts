import {
    getWrittenTestMarksGrid,
    getWrittenTestMarksInitialData,
    getWrittenTestMarksStudents,
    saveWrittenTestMarks
} from '@/server/admission/preadmission/transactions/written_test_marks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const WRITTEN_TEST_MARKS_KEYS = {
    INITIAL_DATA: 'written-test-marks-initial',
    STUDENTS: 'written-test-marks-students',
    GRID: 'written-test-marks-grid'
};

export function useWrittenTestMarksInitialData() {
    return useQuery({
        queryKey: [WRITTEN_TEST_MARKS_KEYS.INITIAL_DATA],
        queryFn: getWrittenTestMarksInitialData
    });
}

export function useWrittenTestMarksStudents(pawtsId: number | null) {
    return useQuery({
        queryKey: [WRITTEN_TEST_MARKS_KEYS.STUDENTS, pawtsId],
        queryFn: () => getWrittenTestMarksStudents(pawtsId as number),
        enabled: !!pawtsId
    });
}

export function useWrittenTestMarksGrid() {
    return useMutation({
        mutationFn: getWrittenTestMarksGrid,
        onError: () => {
            toast.error('Failed to fetch written test marks grid');
        }
    });
}

export function useSaveWrittenTestMarks() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveWrittenTestMarks,
        onSuccess: () => {
            toast.success('Record Saved Successfully');
        },
        onError: () => {
            toast.error('Failed to save written test marks');
        }
    });
}
