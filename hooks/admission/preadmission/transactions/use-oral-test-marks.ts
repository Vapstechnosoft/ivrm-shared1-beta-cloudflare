import {
    getOralTestMarksGrid,
    getOralTestMarksInitialData,
    getOralTestMarksStudents,
    saveOralTestMarks
} from '@/server/admission/preadmission/transactions/oral_test_marks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const ORAL_TEST_MARKS_KEYS = {
    INITIAL_DATA: 'oral-test-marks-initial',
    STUDENTS: 'oral-test-marks-students',
    GRID: 'oral-test-marks-grid'
};

export function useOralTestMarksInitialData() {
    return useQuery({
        queryKey: [ORAL_TEST_MARKS_KEYS.INITIAL_DATA],
        queryFn: getOralTestMarksInitialData
    });
}

export function useOralTestMarksStudents(paotsId: number | null) {
    return useQuery({
        queryKey: [ORAL_TEST_MARKS_KEYS.STUDENTS, paotsId],
        queryFn: () => getOralTestMarksStudents(paotsId as number),
        enabled: !!paotsId
    });
}

export function useOralTestMarksGrid() {
    return useMutation({
        mutationFn: getOralTestMarksGrid,
        onError: () => {
            toast.error('Failed to fetch oral test marks grid');
        }
    });
}

export function useSaveOralTestMarks() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveOralTestMarks,
        onSuccess: () => {
            toast.success('Record Saved Successfully');
            // We can optionally invalidate initial data or reset state
        },
        onError: () => {
            toast.error('Failed to save oral test marks');
        }
    });
}
