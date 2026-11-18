import { PREADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    checkAddParticipants,
    deleteOralTestSchedule,
    deleteOralTestScheduleStudentData,
    getClasswiseStudent,
    getOralTestScheduleDetails,
    getRemarksReportDetails,
    getScheduleReportDetails,
    getSelectedRowDetails,
    removeStudents,
    saveOralTestSchedule,
    sendReminder
} from '@/server/admission/preadmission/transactions/oral_test_schedule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useOralTestScheduleDetails() {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS],
        queryFn: () => getOralTestScheduleDetails(),
        select: (data: any) => {
            let scheduleArray = data?.oralTestSchedule || data?.OralTestSchedule;
            if (scheduleArray && !Array.isArray(scheduleArray) && scheduleArray.$values) {
                scheduleArray = scheduleArray.$values;
            }
            if (!Array.isArray(scheduleArray)) scheduleArray = [];

            let studentList1Array = data?.studentList1 || data?.StudentList1;
            if (studentList1Array && !Array.isArray(studentList1Array) && studentList1Array.$values) {
                studentList1Array = studentList1Array.$values;
            }
            if (!Array.isArray(studentList1Array)) studentList1Array = [];

            const mappedSchedule = scheduleArray.map((schedule: any) => {
                const countMatch = studentList1Array.find(
                    (s: any) => (s.PAOTS_Id ?? s.paotS_Id) === (schedule.paotS_Id ?? schedule.PAOTS_Id)
                );
                return {
                    ...schedule,
                    paotS_Id: schedule.paotS_Id ?? schedule.PAOTS_Id,
                    paotS_ScheduleName: schedule.paotS_ScheduleName ?? schedule.PAOTS_ScheduleName,
                    paotS_ScheduleDate: schedule.paotS_ScheduleDate ?? schedule.PAOTS_ScheduleDate,
                    paotS_ScheduleTime: schedule.paotS_ScheduleTime ?? schedule.PAOTS_ScheduleTime,
                    paotS_ScheduleTimeTo: schedule.paotS_ScheduleTimeTo ?? schedule.PAOTS_ScheduleTimeTo,
                    ocount: countMatch?.ocount || 0
                };
            });

            return {
                ...data,
                classlist: data?.classlist?.$values || data?.classlist || data?.admissioncatdrpall?.$values || data?.admissioncatdrpall || [],
                oralTestSchedule: mappedSchedule
            };
        }
    });
}

export function useClasswiseStudents(classId: number | null) {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.CLASSWISE_STUDENTS, classId],
        queryFn: () => getClasswiseStudent(classId as number),
        enabled: classId !== null,
        select: (data: any) => {
            const list = data?.studentlist || data?.allname5 || [];
            const uniqueList = Array.from(new Map(list.map((s: any) => [s.pasR_Id || s.pasrId || s.pasR_ID, s])).values());
            return uniqueList.map((s: any, index: number) => ({
                ...s,
                pasR_Id: s.pasR_Id || s.pasrId || s.pasR_ID || index + 1,
                pasR_FirstName: s.pasR_FirstName || s.studentName || '',
                pasR_RegistrationNo: s.pasR_RegistrationNo || s.registrationNo || '',
                pasR_Sex: s.pasR_Sex || s.gender || '',
                pasR_MobileNo: s.pasR_MobileNo || s.mobileNo || '',
                pasR_emailId: s.pasR_EmailId || s.emailId || '', // Support both casings
                asmcL_Id: s.asmcL_Id || s.classId || 0,
                asmcL_ClassName: s.asmcL_ClassName || s.className || '',
                classname: s.asmcL_ClassName || s.className || '' // Support both casings
            }));
        }
    });
}

export function useSaveOralTestSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: saveOralTestSchedule,
        onSuccess: (response) => {
            if (response?.returnvalue === 'false') {
                toast.error('Record Already Exist With Same Schedule Name/Date');
            } else {
                toast.success('Interview Scheduled Successfully');
                queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
            }
        },
        onError: () => {
            toast.error('Failed to save schedule');
        }
    });
}

export function useDeleteOralTestSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteOralTestSchedule,
        onSuccess: () => {
            toast.success('Record Deleted successfully');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
        },
        onError: () => {
            toast.error('Failed to delete schedule');
        }
    });
}

export function useOralTestScheduleSelectedRow(id: number) {
    return useQuery({
        queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS, id],
        queryFn: () => getSelectedRowDetails(id),
        enabled: id > 0
    });
}

export function useDeleteOralTestScheduleStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ paotsId, pasrId }: { paotsId: number; pasrId: number }) => deleteOralTestScheduleStudentData(paotsId, pasrId),
        onSuccess: () => {
            toast.success('Record Deleted Successfully');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
        }
    });
}

export function useScheduleReportDetails() {
    return useMutation({
        mutationFn: (paotsId: number) => getScheduleReportDetails(paotsId)
    });
}

export function useRemarksReportDetails() {
    return useMutation({
        mutationFn: (paotsId: number) => getRemarksReportDetails(paotsId)
    });
}

export function useUpdateParticipants() {
    return useMutation({
        mutationFn: checkAddParticipants,
        onSuccess: (promise) => {
            if (promise.returnval === true) {
                toast.success('Record Updated successfully');
            } else {
                toast.error('Record update failed');
            }
        }
    });
}

export function useRemoveStudents() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeStudents,
        onSuccess: () => {
            toast.success('Records removed successfully');
            queryClient.invalidateQueries({ queryKey: [PREADMISSION_QUERY_KEYS.ORAL_TEST_SCHEDULE_DETAILS] });
        }
    });
}

export function useSendReminder() {
    return useMutation({
        mutationFn: sendReminder,
        onSuccess: () => {
            toast.success('Reminder sent successfully');
        }
    });
}
