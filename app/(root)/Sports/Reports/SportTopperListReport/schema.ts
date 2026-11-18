import { z } from 'zod';

export const sportTopperListSchema = z
    .object({
        type: z.enum(['House', 'CS']),
        asmaY_Id: z
            .number({ required_error: 'Select Academic Year', invalid_type_error: 'Select Academic Year' })
            .min(1, 'Select Academic Year'),

        // Common fields
        spccmH_Id: z.array(z.coerce.number()).default([]),
        spccmE_Id: z.array(z.coerce.number()).default([]), // Event
        spccmscC_Id: z.array(z.coerce.number()).default([]), // Sports

        // CS specific
        asmcL_Id: z.number().optional(),
        asmS_Id: z.array(z.coerce.number()).default([])
    })
    .superRefine((data, ctx) => {
        // House is mandatory for both
        if (!data.spccmH_Id || data.spccmH_Id.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select at least one House',
                path: ['spccmH_Id']
            });
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

        if (!data.spccmE_Id || data.spccmE_Id.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select at least one Event',
                path: ['spccmE_Id']
            });
        }
    });
// Sports selection seems optional in terms of "Select Sports" dropdown (multiselect).
// Wait, is it required?
// In HTML: <div class="col-sm-6"> ... Sports Name ...
// It doesn't have required attribute explicitly on the multiselect input checkbox logic visible in snippet,
// but usually filter reports require at least some selection.
// Let's make it optional for now effectively unless mandated, but good practice is to allow All or specific.
// Actually, let's look at legacy "isOptionsRequiredevent" equivalent for sports?
// It was commented out in JS: //$scope.isOptionsRequiredevent = ...
// So maybe optional.

export type SportTopperListFormData = z.infer<typeof sportTopperListSchema>;
