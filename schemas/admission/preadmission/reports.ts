import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const masterStudentCountReportSchema = {
    addOrUpdate: z
        .object({
            type: z.string().default('between'), // between or yearwise
            report_type: z.string().min(1, 'please select report type'),
            from_date: z.string().optional(),
            to_date: z.string().optional(),
            asmaY_Id: z.number().int().optional(),
            asmcL_Id: z.number().int().optional().default(0)
        })
        .superRefine((data, ctx) => {
            if (data.type === 'yearwise') {
                if (!data.asmaY_Id || data.asmaY_Id === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'please select academic year',
                        path: ['asmaY_Id']
                    });
                }
            } else if (data.type === 'between') {
                if (!data.from_date) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'please select from date',
                        path: ['from_date']
                    });
                }
                if (!data.to_date) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'please select to date',
                        path: ['to_date']
                    });
                }
            }

            if (data.report_type && !['1', '2'].includes(data.report_type)) {
                if (data.asmcL_Id === undefined) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'please select class',
                        path: ['asmcL_Id']
                    });
                }
            }
        }),
    delete: z.object({
        asmay_id: deleteIdSchema('asmay_id')
    })
};

export const studentSearchSchema = z.object({
    status: z.enum(['all', 'studying', 'left'], {
        required_error: 'Please select student status'
    }),
    criteria: z
        .array(
            z.object({
                field: z.string().min(1, 'Field is required'),
                operator: z.string().min(1, 'Operator is required'),
                value: z.string().min(1, 'Value is required'),
                condition: z.string().optional()
            })
        )
        .min(1, 'At least one search criteria is required')
});

export type StudentSearchFormData = z.infer<typeof studentSearchSchema>;

export const admissionReportSchema = z.object({
    academicYear: z.coerce.number().min(1, 'Academic year is required'),
    status: z.number().min(0, 'Status is required'),
    selectedClasses: z.array(z.number()).min(1, 'Please select at least one class'),
    selectedFields: z.array(z.string()).min(1, 'Please select at least one field')
});

export const TotalStrengthSchema = z
    .object({
        reportType: z.enum(['All', 'Individual']),
        status: z.string().min(1, 'Status is required'),
        withTc: z.boolean().optional().default(false),
        withDeactive: z.boolean().optional().default(false),
        academicYear: z.number().min(1, 'Academic year is required'),
        class: z.string().optional(),
        section: z.string().optional()
    })
    .refine(
        (data) => {
            if (data.reportType === 'Individual') {
                return !!data.class && !!data.section;
            }
            return true;
        },
        {
            message: 'Class and Section are required for Individual report',
            path: ['class']
        }
    );

export const STCS_TotalStrengthSchema = z
    .object({
        reportType: z.enum(['All', 'Individual']),
        status: z.string().min(1, 'Status is required'),
        withTc: z.boolean().optional().default(false),
        withDeactive: z.boolean().optional().default(false),
        academicYear: z.number().min(1, 'Academic year is required'),
        class: z.string().optional(),
        section: z.string().optional(),
        category: z.string().optional(),
        electives: z.array(z.number()).optional().default([])
    })
    .refine(
        (data) => {
            if (data.reportType === 'Individual') {
                return !!data.class && !!data.section;
            }
            return true;
        },
        {
            message: 'Class and Section are required for Individual report',
            path: ['class']
        }
    );

export const studyCertificateReportSchema = z.object({
    selectionMode: z.enum(['all', 'individual']),
    studentStatus: z.enum(['studying', 'left', 'deactive']),
    certificateType: z.enum(['character', 'study']),
    addressType: z.enum(['permanent', 'communication']),
    asmaY_Id: z.number().min(1, 'Academic year required'),
    asmcL_Id: z.number().optional(),
    asmS_Id: z.number().optional(),
    studentId: z.number().optional(),
    qrCode: z.string().optional(),
    from_date: z.string().min(1, 'From date required')
});
export const classwiseStudentDetailsSchema = z.object({
    asmaY_Id: z.number().min(1, 'Academic year is required'),
    classes: z.array(z.number()).min(1, 'Classes is required'),
    class_section: z.array(z.number()).min(1, 'Please select at least one section'),
    selectedFields: z.array(z.string()).min(1, 'Please select at least one column'),
    fmcC_Id: z.number().optional(),
    flag: z.string().optional()
});

export const StudentTcDetailsSchema = z.object({
    ASMAY_Id: z.number().min(1, 'Academic year is required'),
    AllOrInd: z.number().min(1, 'Please select All or Individual'),
    ASMCL_Id: z.number().optional(),
    ASMC_Id: z.number().optional(),
    TempararyArrayheadList: z
        .array(
            z.object({
                columnID: z.string(),
                columnName: z.string().optional()
            })
        )
        .min(1, 'Please select at least one column'),
    PermOrTemp: z.number().optional(),
    AMC_Id: z.number().optional()
});

export const CategoryWiseAttendanceSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    categoryList: z.array(z.number()).optional().default([]),
    date: z.date({
        required_error: 'Date is required',
        invalid_type_error: "That's not a date!"
    })
});

export const ClassWiseDailyAttendanceSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    fromDate: z.date({
        required_error: 'Date is required',
        invalid_type_error: "That's not a date!"
    })
});

export const scheduleReportSchema = z
    .object({
        autostudent: z.boolean().default(false),
        yearwiseorbtwdates: z.enum(['yearwise', 'btwdates']).default('yearwise'),
        asmaY_Id: z.number().optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
        asmcL_Id: z.number().int().min(0, 'Please select Class'), // 0 is "All"
        oralwrittenschedule: z.enum(['oral', 'written', 'statusschedule']),
        hrsrt: z.enum(['12hrrt', '24hrrt']).default('12hrrt'),
        disid: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (data.yearwiseorbtwdates === 'yearwise') {
            if (!data.asmaY_Id || data.asmaY_Id === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select academic year',
                    path: ['asmaY_Id']
                });
            }
            if (!data.disid) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select schedule',
                    path: ['disid']
                });
            }
        } else {
            if (!data.from_date) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select from date',
                    path: ['from_date']
                });
            }
            if (!data.to_date) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select to date',
                    path: ['to_date']
                });
            }
        }
    });
