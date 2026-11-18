import { z } from 'zod';

export const oralTestScheduleSchema = z.object({
    paotS_Id: z.number().optional().default(0),
    paotS_ScheduleName: z.string().min(1, 'Schedule Name is required'),
    asmcL_Id: z.string().min(1, 'Class is required'),
    paotS_ScheduleDate: z.date({
        required_error: 'Schedule Date is required',
        invalid_type_error: 'Invalid Date'
    }),
    paotS_ScheduleTime: z.string().min(1, 'Please select Schedule Time From'),
    paotS_ScheduleTimeTo: z.string().min(1, 'Please select Schedule Time To'),
    paotS_Remarks: z.string().optional().nullable(),
    paotS_Superviser: z.string().optional().nullable(),
    paotS_Skills: z.string().optional().nullable(),
    paotS_TPFlag: z.boolean().default(false),
    paotS_TimePeriod: z.union([z.number(), z.string().transform(Number)]).refine((n) => n > 0, {
        message: 'Interaction time must be at least 1 minute'
    }),
    paotS_Strength: z.union([z.number(), z.string().transform(Number)]).refine((n) => n > 0, {
        message: 'No. of Students must be at least 1'
    }),
    autoschedule: z.boolean().default(false),
    meetingvc: z.boolean().default(false),
    pavidc: z.boolean().default(false),
    autostudent: z.boolean().default(true),
    stafflag: z.boolean().default(false),
    principalflg: z.boolean().default(false),
    managerflg: z.boolean().default(false),
    anybodystart: z.boolean().default(false),
    addParticipants: z.boolean().default(false)
});

export type OralTestScheduleFormValues = z.infer<typeof oralTestScheduleSchema>;

export const oralReScheduleSchema = oralTestScheduleSchema.extend({
    previousScheduleId: z.string().min(1, 'Please select a Previous Schedule'),
    asmcL_Id: z.string().optional().default('0')
});

export type OralReScheduleFormValues = z.infer<typeof oralReScheduleSchema>;
