import { z } from 'zod';

export const ContributionReportPageSchema = z
    .object({
        groupType: z.array(z.string()).min(1, 'Group Type is required'),
        department: z.array(z.string()).min(1, 'Department is required'),
        designation: z.array(z.string()).min(1, 'Designation is required'),

        earningDeduction: z.enum(['Earning', 'Deduction']).optional(),
        earningHead: z.string().optional(),
        deductionHead: z.string().optional(),

        monthBetweenDates: z.enum(['Month', 'BetweenDates']).optional(),
        month: z.string().optional(),
        year: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),

        formatType: z.enum(['Format1', 'Format2']).optional(),
        employee: z.number().optional()
    })
    .superRefine((data, ctx) => {
        // ✅ Month / Date validation
        if (data.monthBetweenDates === 'Month') {
            if (!data.month) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Month is required',
                    path: ['month']
                });
            }
            if (!data.year) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Year is required',
                    path: ['year']
                });
            }
        }

        if (data.monthBetweenDates === 'BetweenDates') {
            if (!data.fromDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'From Date is required',
                    path: ['fromDate']
                });
            }
            if (!data.toDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'To Date is required',
                    path: ['toDate']
                });
            }
        }

        // ✅ Earning / Deduction validation
        if (data.earningDeduction === 'Earning' && !data.earningHead) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Earning Head is required',
                path: ['earningHead']
            });
        }

        if (data.earningDeduction === 'Deduction' && !data.deductionHead) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Deduction Head is required',
                path: ['deductionHead']
            });
        }

        // ✅ Format2 → Employee required
        if (data.formatType === 'Format1' && !data.employee) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Employee is required',
                path: ['employee']
            });
        }
    });

// Salary Certificate Schema

export const SalaryCertificateSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Group Type is required'),
    department: z.array(z.string()).min(1, 'Department is required'),
    designation: z.array(z.string()).min(1, 'Designation is required'),
    month: z.string().min(1, { message: 'Month is required' }),
    year: z.string().min(1, { message: 'Year is required' }),
    employee: z.number().min(1, { message: 'Employee is required' })
});

export type SalaryCertificateFormFields = z.infer<typeof SalaryCertificateSchema>;

export const FrontOfficeAddLogsSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Group Type is required'),
    department: z.array(z.string()).min(1, 'Department is required'),
    designation: z.array(z.string()).min(1, 'Designation is required'),
    date: z.date({ required_error: 'Date is required' }),
    employee: z.string().min(1, { message: 'Employee is required' }),
    punchTime: z
        .string()
        .min(1, { message: 'Punch Time is required' })
        .refine((val) => val !== 'HH:MM', { message: 'Please select a valid time' }),
    inOutFlag: z.string().min(1, { message: 'In Out Flag is required' }),
    remarks: z.string().optional()
});

export type FrontOfficeAddLogsFormFields = z.infer<typeof FrontOfficeAddLogsSchema>;
