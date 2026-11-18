import { z } from 'zod';

export const gatePassSchema = z
    .object({
        gatePassType: z.enum(['student', 'employee']),
        studentId: z.number().optional(),
        employeeId: z.number().optional(),
        remarks: z.string().min(1, 'Remarks is required').max(250, 'Remarks must not exceed 250 characters')
    })
    .refine(
        (data) => {
            if (data.gatePassType === 'student') return !!data.studentId;
            if (data.gatePassType === 'employee') return !!data.employeeId;
            return false;
        },
        {
            message: 'Please select Student or Employee',
            path: ['studentId'] // Default to studentId for error pointing
        }
    );

export type GatePassSchema = z.infer<typeof gatePassSchema>;
