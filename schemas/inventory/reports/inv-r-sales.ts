import { z } from 'zod';

export const invRSalesSchema = z
    .object({
        typeflag: z.enum(['All', 'Overall', 'Detailed']),
        optionflag: z.string().optional(),
        individualflag: z.string().optional(), // "C", "CS"
        bw_dates: z.boolean().default(false),
        startdate: z.date().optional(),
        enddate: z.date().optional(),

        // Filters
        singleStudentId: z.coerce.number().optional(),
        singleStaffId: z.coerce.number().optional(),
        singleCustomerId: z.coerce.number().optional(),

        // Arrays
        salesArray: z.array(z.any()).optional(),
        itemArray: z.array(z.any()).optional(),
        classId: z.string().optional(), // Selected Class ID
        sectionId: z.string().optional(), // Selected Section ID (for CS mode)
        studentArray: z.array(z.any()).optional(), // Multi-select students (from class/section)

        // Column Toggles
        showTax: z.boolean().default(false),
        showDiscount: z.boolean().default(false)
    })
    .superRefine((data, ctx) => {
        // Date Validation
        if (data.bw_dates) {
            if (!data.startdate) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start Date is required', path: ['startdate'] });
            }
            if (!data.enddate) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'End Date is required', path: ['enddate'] });
            }
            if (data.startdate && data.enddate && data.startdate > data.enddate) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Start Date cannot be greater than End Date', path: ['enddate'] });
            }
        }

        // Option Validation
        if (data.typeflag === 'Overall' || data.typeflag === 'Detailed') {
            if (!data.optionflag) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a Filter option', path: ['optionflag'] });
                return;
            }

            if (data.optionflag === 'Saleno') {
                if (!data.salesArray || data.salesArray.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select at least one Sale No', path: ['salesArray'] });
                }
            }
            if (data.optionflag === 'Item') {
                if (!data.itemArray || data.itemArray.length === 0) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select at least one Item', path: ['itemArray'] });
                }
            }
            if (data.optionflag === 'Staff') {
                if (!data.singleStaffId) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a Staff member', path: ['singleStaffId'] });
                }
            }
            if (data.optionflag === 'Customer') {
                if (!data.singleCustomerId) {
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a Customer', path: ['singleCustomerId'] });
                }
            }
            if (data.optionflag === 'Student') {
                // Class or Class/Section Mode
                if (!data.individualflag) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Please select a Student Selection Mode',
                        path: ['individualflag']
                    });
                } else {
                    if (!data.classId) {
                        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a Class', path: ['classId'] });
                    } else {
                        if (data.individualflag === 'CS' && !data.sectionId) {
                            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a Section', path: ['sectionId'] });
                        }
                        if (!data.studentArray || data.studentArray.length === 0) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: 'Please select at least one Student',
                                path: ['studentArray']
                            });
                        }
                    }
                }
            }
        }
    });

export type InvRSalesSchema = z.infer<typeof invRSalesSchema>;
