import { z } from 'zod';

export const sportVenuewiseParticipationReportSchema = z
    .object({
        type: z.enum(['House', 'CS']),
        asmaY_Id: z.coerce
            .number({ invalid_type_error: 'Select academic year', required_error: 'Select academic year' })
            .min(1, 'Select academic year'),

        // For Type 'CS'
        asmcL_Id: z.coerce.number().optional(),
        asmS_Id: z.array(z.coerce.number()).optional(),

        // For Type 'House' (now common)
        spccmH_Id: z.array(z.coerce.number()).min(1, 'Select at least one House'),

        // Common
        spccmeV_Id: z.array(z.coerce.number()).min(1, 'Select at least one Venue')
    })
    .refine(
        (data) => {
            if (data.type === 'CS') {
                return !!data.asmcL_Id;
            }
            return true;
        },
        {
            message: 'Select Class',
            path: ['asmcL_Id']
        }
    )
    .refine(
        (data) => {
            if (data.type === 'CS') {
                return data.asmS_Id && data.asmS_Id.length > 0;
            }
            return true;
        },
        {
            message: 'Select at least one Section',
            path: ['asmS_Id']
        }
    );

export type SportVenuewiseParticipationReportFormData = z.infer<typeof sportVenuewiseParticipationReportSchema>;
