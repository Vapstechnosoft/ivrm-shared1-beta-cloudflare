import * as z from 'zod';

export const writtenTestScheduleSchema = z.object({
    pawtS_Id: z.number().optional(),
    pawtS_ScheduleName: z.string().min(1, 'Schedule Name is required'),
    asmcL_Id: z.string().min(1, 'Class is required'),
    pawtS_ScheduleDate: z.date({
        required_error: 'Schedule Date is required'
    }),
    pawtS_ScheduleTime: z.string().min(1, 'Schedule Time From is required'),
    pawtS_ScheduleTimeTo: z.string().min(1, 'Schedule Time To is required'),
    pawtS_Remarks: z.string().optional(),
    pawtS_Superviser: z.string().optional(),
    pawtS_Skills: z.string().optional(),
    NoOfStud: z.number().optional()
});

export type WrittenTestScheduleFormValues = z.infer<typeof writtenTestScheduleSchema>;
