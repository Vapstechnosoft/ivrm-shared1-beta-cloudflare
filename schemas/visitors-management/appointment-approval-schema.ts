import { z } from 'zod';

export const appointmentApprovalSchema = z
    .object({
        VMAP_Id: z.number().optional(),
        VMAP_HRME_Id: z.number().min(1, 'Staff Name is required'),
        VMAP_MeetingDateTime: z.date({
            required_error: 'Meeting Date is required'
        }),
        VMAP_MeetingTiming: z.string().min(1, 'From Time is required'),
        VMAP_MeetingToTime: z.string().min(1, 'To Time is required'),
        VMAP_Remarks: z.string().min(1, 'Remarks is required').max(250, 'Remarks must be less than 250 characters'),
        VMAP_Status: z.enum(['Approved', 'Rejected', 'Canceled', 'RE-SCHEDULE'], {
            required_error: 'Status is required'
        }),
        VMAP_RescheduleReason: z.string().optional(),

        // Reminder fields
        VMAP_ReminderFlag: z.enum(['Day', 'Hour', 'Mints']).optional(),
        VMAP_ReminderSchedule: z.string().optional(), // Stores days/hours/mins value
        VMAP_RepeatFlag: z.string().optional()
    })
    .refine(
        (data) => {
            if (data.VMAP_Status === 'RE-SCHEDULE' && !data.VMAP_RescheduleReason) {
                return false;
            }
            return true;
        },
        {
            message: 'Reschedule Reason is required when Status is RE-SCHEDULE',
            path: ['VMAP_RescheduleReason']
        }
    )
    .refine(
        (data) => {
            if (data.VMAP_Status === 'Approved' && data.VMAP_ReminderFlag) {
                if (!data.VMAP_ReminderSchedule || !data.VMAP_RepeatFlag) return false;
            }
            return true;
        },
        {
            message: 'Reminder details are required',
            path: ['VMAP_ReminderSchedule']
        }
    );

export type AppointmentApprovalSchema = z.infer<typeof appointmentApprovalSchema>;

export const feedbackSchema = z.object({
    VMAP_Id: z.number(),
    VMAP_Feedback: z.string().min(1, 'Feedback is required')
});

export type FeedbackSchema = z.infer<typeof feedbackSchema>;
