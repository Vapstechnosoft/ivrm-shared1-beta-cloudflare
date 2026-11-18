import { z } from 'zod';

export const sportsYearEndReportSchema = z
    .object({
        type: z.string().default('AY'),
        asmaY_Id: z
            .number({ required_error: 'Select Academic Year', invalid_type_error: 'Select Academic Year' })
            .min(1, 'Select Academic Year'),
        selectedClasslist: z.array(z.object({ asmcL_Id: z.number() })).default([]),
        selectedSectionlist: z.array(z.object({ asmS_Id: z.number() })).default([])
    })
    .superRefine((data, ctx) => {
        if (data.type === 'CS') {
            if (!data.selectedClasslist || data.selectedClasslist.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select at least one Class',
                    path: ['selectedClasslist']
                });
            }
            if (!data.selectedSectionlist || data.selectedSectionlist.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select at least one Section',
                    path: ['selectedSectionlist']
                });
            }
        }
    });

export type SportsYearEndReportFormData = z.infer<typeof sportsYearEndReportSchema>;
