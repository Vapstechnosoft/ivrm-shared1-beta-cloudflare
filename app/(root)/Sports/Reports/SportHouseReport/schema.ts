import { z } from 'zod';

export const sportHouseReportSchema = z
    .object({
        type: z.enum(['House', 'CS']),
        asmaY_Id: z
            .number({ required_error: 'Select Academic Year', invalid_type_error: 'Select Academic Year' })
            .min(1, 'Select Academic Year'),
        spccmH_Id: z.array(z.coerce.number()).default([]),
        asmcL_Id: z.number().optional(),
        asmS_Id: z.array(z.coerce.number()).default([])
    })
    .superRefine((data, ctx) => {
        if (data.type === 'House') {
            if (!data.spccmH_Id || data.spccmH_Id.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select at least one House',
                    path: ['spccmH_Id']
                });
            }
        }
        if (data.type === 'CS') {
            if (!data.asmcL_Id || data.asmcL_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select Class',
                    path: ['asmcL_Id']
                });
            }
            if (!data.asmS_Id || data.asmS_Id.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select at least one Section',
                    path: ['asmS_Id']
                });
            }
        }
    });

export type SportHouseReportFormData = z.infer<typeof sportHouseReportSchema>;
