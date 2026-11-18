import { z } from 'zod';

export const cumulativereportSchema = {
    addOrUpdate: z
        .object({
            emE_ID: z.number().optional(),
            mI_Id: z.number().optional(),

            // Core Dropdowns
            asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),

            asmcL_Id: z.number({ required_error: 'Class  is required' }).min(1, { message: 'Please select Class ' }),

            asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select  Section' }),

            emE_Id: z.number({ required_error: 'Exam Name is required' }).min(1, { message: 'Please select a Exam Name' }),

            studentList: z
                .array(
                    z.object({
                        amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                    })
                )
                .min(1, { message: 'At least one Student must be selected' }),

            // Flags & Remarks
            applicableFlag: z.boolean().default(true).optional(),
            nonApplicableFlag: z.boolean().default(true).optional()
        })
        .superRefine((data, ctx) => {
            // Disallow duplicate subjects
            const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
            if (new Set(studentIds).size !== studentIds.length) {
                ctx.addIssue({
                    path: ['studentList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Students are not allowed'
                });
            }
        })
};

export const vvehpc_examreportcardSchema = {
    addOrUpdate: z
        .object({
            emE_ID: z.number().optional(),
            mI_Id: z.number().optional(),

            // Core Dropdowns
            asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),

            asmcL_Id: z.number({ required_error: 'Class  is required' }).min(1, { message: 'Please select Class ' }),

            asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select  Section' }),

            emE_Id: z.number({ required_error: 'Exam Name is required' }).min(1, { message: 'Please select a Exam Name' }),

            studentList: z
                .array(
                    z.object({
                        amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                    })
                )
                .min(1, { message: 'At least one Student must be selected' })
        })
        .superRefine((data, ctx) => {
            // Disallow duplicate subjects
            const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
            if (new Set(studentIds).size !== studentIds.length) {
                ctx.addIssue({
                    path: ['studentList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Students are not allowed'
                });
            }
        })
};

export const examelectivesreportSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),

        Type: z.enum(['All', 'Indi', 'subj', 'csw'], {
            required_error: 'Report Type is required'
        }),

        emcA_Id: z.union([z.number(), z.literal('All')]).optional(),

        emG_Id: z.number().optional(),
        ismS_Id: z.number().optional(),
        asmcL_Id: z.number().optional(),
        asmS_Id: z.number().optional(),

        mob_flg: z.boolean().optional(),
        mail_flg: z.boolean().optional(),
        Left_Flag: z.boolean().optional(),
        Deactive_Flag: z.boolean().optional()
    })
};

export const examCategoryReportSchema = z
    .object({
        type: z.enum(['1', '2']), // 1=All, 2=Individual
        asmaY_Id: z.string().min(1, { message: 'Select Academic Year' }),
        emcA_Id: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (data.type === '2' && (!data.emcA_Id || data.emcA_Id === '')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Select Category',
                path: ['emcA_Id']
            });
        }
    });

export type ExamCategoryReportFormValues = z.infer<typeof examCategoryReportSchema>;

export const examMonthEndReportSchema = z.object({
    ASMAY_Id: z.string().min(1, { message: 'Academic Year is required' }),
    IVRM_Month_Id: z.string().min(1, { message: 'Month is required' }),
    EME_Id: z.string().min(1, { message: 'Exam is required' }),
    iename: z.string().optional(),
    radiodata: z.string().default('All')
});

export type ExamMonthEndReportFormValues = z.infer<typeof examMonthEndReportSchema>;

export const tbs_reportschoolSchema = {
    addOrUpdate: z
        .object({
            asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
            asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
            asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
            emE_Id: z
                .array(
                    z.object({
                        emE_Id: z.number()
                    })
                )
                .min(1, { message: 'Select at least one Exam' }),
            emgR_Id: z.number({ required_error: 'Grade is required' }).min(1, { message: 'Please select Grade' }),
            studentList: z
                .array(
                    z.object({
                        amsT_Id: z.number()
                    })
                )
                .min(1, { message: 'Select at least one Student' }),
            // Fee-related fields (optional)
            feeGroupIds: z.array(z.number()).optional().default([]),
            feeTermIds: z.array(z.number()).optional().default([]),
            feeClassIds: z.array(z.number()).optional().default([]),
            feeSectionIds: z.array(z.number()).optional().default([]),
            feeBusRouteIds: z.array(z.number()).optional().default([]),
            feeCustomGroupIds: z.array(z.number()).optional().default([])
        })
        .superRefine((data, ctx) => {
            // Validate no duplicate students
            const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
            if (new Set(studentIds).size !== studentIds.length) {
                ctx.addIssue({
                    path: ['studentList'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Students are not allowed'
                });
            }

            // Validate no duplicate exams
            const examIds = data.emE_Id?.map((e) => e.emE_Id) || [];
            if (new Set(examIds).size !== examIds.length) {
                ctx.addIssue({
                    path: ['emE_Id'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Exams are not allowed'
                });
            }

            // Validate no duplicate fee groups
            if (data.feeGroupIds && new Set(data.feeGroupIds).size !== data.feeGroupIds.length) {
                ctx.addIssue({
                    path: ['feeGroupIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Groups are not allowed'
                });
            }

            // Validate no duplicate fee terms
            if (data.feeTermIds && new Set(data.feeTermIds).size !== data.feeTermIds.length) {
                ctx.addIssue({
                    path: ['feeTermIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Terms are not allowed'
                });
            }

            // Validate no duplicate fee classes
            if (data.feeClassIds && new Set(data.feeClassIds).size !== data.feeClassIds.length) {
                ctx.addIssue({
                    path: ['feeClassIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Classes are not allowed'
                });
            }

            // Validate no duplicate fee sections
            if (data.feeSectionIds && new Set(data.feeSectionIds).size !== data.feeSectionIds.length) {
                ctx.addIssue({
                    path: ['feeSectionIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Fee Sections are not allowed'
                });
            }

            // Validate no duplicate bus routes
            if (data.feeBusRouteIds && new Set(data.feeBusRouteIds).size !== data.feeBusRouteIds.length) {
                ctx.addIssue({
                    path: ['feeBusRouteIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Bus Routes are not allowed'
                });
            }

            // Validate no duplicate custom groups
            if (data.feeCustomGroupIds && new Set(data.feeCustomGroupIds).size !== data.feeCustomGroupIds.length) {
                ctx.addIssue({
                    path: ['feeCustomGroupIds'],
                    code: z.ZodIssueCode.custom,
                    message: 'Duplicate Custom Groups are not allowed'
                });
            }
        })
};

export const examLoginPrivilegesReportSchema = z
    .object({
        ASMAY_Id: z.string().min(1, 'Academic Year is required'),
        EMCA_Id: z.string().min(1, 'Category is required'),
        type: z.enum(['all', 'individual']),
        ASMCL_Id: z.string().optional(),
        ASMS_Id: z.string().optional(),
        HRME_Id: z.string().optional(), // Employee
        employeeChecked: z.boolean().default(false),
        selectAllEmployees: z.boolean().default(false)
    })
    .superRefine((data, ctx) => {
        if (data.type === 'individual') {
            if (!data.ASMCL_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Class is required for Individual report',
                    path: ['ASMCL_Id']
                });
            }
            if (!data.ASMS_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Section is required for Individual report',
                    path: ['ASMS_Id']
                });
            }
        }

        if (data.employeeChecked && !data.HRME_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Employee is required when checked',
                path: ['HRME_Id']
            });
        }
    });

export type ExamLoginPrivilegesSchema = z.infer<typeof examLoginPrivilegesReportSchema>;

export const juniorsProgressCardReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    EME_Id: z.string().min(1, 'Exam Name is required'),
    superAverage: z.boolean().default(false),
    printLogo: z.boolean().default(false),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type JuniorsProgressCardReportSchema = z.infer<typeof juniorsProgressCardReportSchema>;

export const juniorsProgressCardReportSchemaForPrint = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    exmname: z.string().min(1, 'Exam Name is required'),
    superAverage: z.boolean().default(false),
    printLogo: z.boolean().default(false),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type JuniorsProgressCardReportSchemaForPrint = z.infer<typeof juniorsProgressCardReportSchemaForPrint>;

export const marksEntryReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    EME_Id: z.string().min(1, 'Exam Name is required')
});

export type MarksEntryReportSchema = z.infer<typeof marksEntryReportSchema>;

export const percentageWiseDetailsReportSchema = z
    .object({
        ASMAY_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Academic Year is required')),
        EMCA_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Category is required')),
        ASMCL_Id: z.preprocess((val) => Number(val), z.number().optional()), // Conditional validation logic in component or refine
        ASMS_Id: z.preprocess((val) => Number(val), z.number().optional()), // Conditional validation logic in component or refine
        EME_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Exam is required')),
        percent: z.string().min(1, 'Percentage is required'),
        qualification_type: z.enum(['all', 'individual'])
    })
    .refine(
        (data) => {
            if (data.qualification_type === 'individual') {
                return !!data.ASMCL_Id && data.ASMCL_Id > 0;
            }
            return true;
        },
        {
            message: 'Class is required',
            path: ['ASMCL_Id']
        }
    )
    .refine(
        (data) => {
            if (data.qualification_type === 'individual') {
                // Section can be 0 (All) but generally selected.
                // In the angular code: value="0">All</option> and required if individual.
                // If 0 is valid "All" for section, then we just need it to be present.
                // If the requirement is "Select Section" (validation failure), then it should not be empty.
                // However, the angular code says `value="" label="Select Section"` and `value="0">All`.
                // So if it's 0, it is valid "All". If it's undefined or empty, it's invalid.
                return data.ASMS_Id !== undefined && data.ASMS_Id !== null;
            }
            return true;
        },
        {
            message: 'Section is required',
            path: ['ASMS_Id']
        }
    );

export type PercentageWiseDetailsReportSchema = z.infer<typeof percentageWiseDetailsReportSchema>;

export const promotionDetailsReportSchema = z
    .object({
        ASMAY_Id: z.string().min(1, 'Academic Year is required'),
        ASMCL_Id: z.string().min(1, 'Class is required'),
        ASMS_Id: z.string().min(1, 'Section is required'),
        EMPG_GroupName: z.string().optional(), // Term
        superAverage: z.boolean().default(false),
        selectedStudents: z.array(z.string()).min(1, 'Select at least one student'),
        selectedStudentNames: z.array(z.string()).optional()
    })
    .refine(
        (data) => {
            if (!data.superAverage && !data.EMPG_GroupName) {
                return false;
            }
            return true;
        },
        {
            message: 'Term is required when Super Average is not selected',
            path: ['EMPG_GroupName']
        }
    );

export type PromotionDetailsReportSchema = z.infer<typeof promotionDetailsReportSchema>;

export const toppersListReportSchema = z
    .object({
        type: z.enum(['1', '2']), // 1: All, 2: Individual
        ASMAY_Id: z.string().min(1, 'Academic Year is required'),
        EMCA_Id: z.string().optional().default('0'),
        ASMCL_Id: z.string().optional(), // Class (Required only for Individual type)
        ASMS_Id: z.string().optional().default('0'), // Section
        topper: z
            .string()
            .min(1, 'Top count is required')
            .regex(/^\d+$/, 'Must be a number')
            .refine((val) => Number.parseInt(val) > 0, 'Top count must be greater than 0'),
        EME_Id: z.string().optional(),
        subjectwise: z.boolean().default(false),
        ISMS_Id: z.string().optional(), // Subject (Required only when subjectwise is checked)
        // Hidden fields for API payload
        exm_check_type: z.string().default('0'),
        sub_check_type: z.string().default('0'),
        report_type: z.string().optional() // This will be derived from 'type'
    })
    .superRefine((data, ctx) => {
        // Conditional validation for Class when type is Individual (2)
        if (data.type === '2' && !data.ASMCL_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Class is required for Individual type',
                path: ['ASMCL_Id']
            });
        }

        // Conditional validation for Subject when subjectwise is checked
        if (data.subjectwise && !data.ISMS_Id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Subject is required when Subjectwise is checked',
                path: ['ISMS_Id']
            });
        }

        // Set derived report_type based on type
        data.report_type = data.type === '1' ? 'All' : 'Indi';

        // Set exm_check_type based on EME_Id
        data.exm_check_type = data.EME_Id ? '1' : '0';

        // Set sub_check_type based on subjectwise and ISMS_Id
        data.sub_check_type = data.subjectwise && data.ISMS_Id ? '1' : '0';
    });

export type ToppersListSchema = z.infer<typeof toppersListReportSchema>;

export const gradeSlabReportSchema = {
    addOrUpdate: z
        .object({
            type: z.enum(['1', '2'], {
                required_error: 'Please select a report type (All or Individual)'
            }),
            emgR_Id: z.string().optional()
        })
        .superRefine((data, ctx) => {
            if (data.type === '2' && !data.emgR_Id) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Select Grade',
                    path: ['emgR_Id']
                });
            }
        })
};

export const reportCardIXSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    brngroup: z.string().min(1, 'Group is required'),
    exmname: z.string().min(1, 'Exam Name is required'),
    printLogo: z.boolean().default(true),
    superAverage: z.boolean().default(true),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type ReportCardIXSchema = z.infer<typeof reportCardIXSchema>;

export const reportCardXSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    brngroup: z.string().min(1, 'Group is required'),
    exmname: z.string().min(1, 'Exam Name is required'),
    printLogo: z.boolean().default(true),
    superAverage: z.boolean().default(true),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type ReportCardXSchema = z.infer<typeof reportCardXSchema>;

export const reportCardXiSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    brngroup: z.string().min(1, 'Group is required'),
    exmname: z.string().min(1, 'Exam Name is required'),
    printLogo: z.boolean().default(true),
    superAverage: z.boolean().default(true),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type ReportCardXiSchema = z.infer<typeof reportCardXiSchema>;

export const burnpurProgressCardSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    date: z.string().min(1, 'Date is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type BurnpurProgressCardSchema = z.infer<typeof burnpurProgressCardSchema>;

export const reportCardViViiiSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    brngroup: z.string().optional(),
    exmname: z.string().min(1, 'Exam Name is required'),
    superAverage: z.boolean().default(true),
    printLogo: z.boolean().default(true),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type ReportCardViViiiSchema = z.infer<typeof reportCardViViiiSchema>;

export const reportCardXXiiSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    brngroup: z.string().min(1, 'Group is required'),
    exmname: z.string().min(1, 'Exam Name is required'),
    printLogo: z.boolean().default(true),
    superAverage: z.boolean().default(true),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type ReportCardXXiiSchema = z.infer<typeof reportCardXXiiSchema>;

export const stellaProgressReportSchema = z
    .object({
        mI_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
        reopenDate: z.date({ required_error: 'Reopen Date is required' }),
        studentList: z
            .array(
                z.object({
                    amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                })
            )
            .min(1, { message: 'At least one Student must be selected' }),
        applicableFlag: z.boolean().default(true).optional(),
        nonApplicableFlag: z.boolean().default(true).optional(),
        page_size: z.number().optional()
    })
    .superRefine((data, ctx) => {
        const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
        if (new Set(studentIds).size !== studentIds.length) {
            ctx.addIssue({
                path: ['studentList'],
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Students are not allowed'
            });
        }
    });

export type StellaProgressReportSchema = z.infer<typeof stellaProgressReportSchema>;

export const vidyaniketanProgressReportSchema = z.object({
    mI_Id: z.number().optional(),
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
    asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
    reopenDate: z.date({ required_error: 'Reopen Date is required' }),
    color: z.enum(['Green', 'Brown'], { required_error: 'Color is required' }),
    emE_Id: z
        .array(
            z.object({
                emE_Id: z.number({ required_error: 'Exam is required' }).min(1, { message: 'Please select Exam' })
            })
        )
        .min(1, { message: 'At least one Exam must be selected' })
});

export type VidyaniketanProgressReportSchema = z.infer<typeof vidyaniketanProgressReportSchema>;

export const vidyaniketanProgressReportItoVIIISchema = z
    .object({
        mI_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
        studentList: z
            .array(
                z.object({
                    amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                })
            )
            .min(1, { message: 'At least one Student must be selected' })
    })
    .superRefine((data, ctx) => {
        const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
        if (new Set(studentIds).size !== studentIds.length) {
            ctx.addIssue({
                path: ['studentList'],
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Students are not allowed'
            });
        }
    });

export type VidyaniketanProgressReportItoVIIISchema = z.infer<typeof vidyaniketanProgressReportItoVIIISchema>;

export const sophiaProgressReportIXtoXSchema = z
    .object({
        mI_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
        emE_Id: z.number({ required_error: 'Exam Name is required' }).min(1, { message: 'Please select a Exam Name' }),
        studentList: z
            .array(
                z.object({
                    amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                })
            )
            .min(1, { message: 'At least one Student must be selected' })
    })
    .superRefine((data, ctx) => {
        const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
        if (new Set(studentIds).size !== studentIds.length) {
            ctx.addIssue({
                path: ['studentList'],
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Students are not allowed'
            });
        }
    });

export type SophiaProgressReportIXtoXSchema = z.infer<typeof sophiaProgressReportIXtoXSchema>;

export const sophiaProgressReportPreIISchema = z
    .object({
        mI_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
        emE_Id: z.number({ required_error: 'Exam Name is required' }).min(1, { message: 'Please select a Exam Name' }),
        studentList: z
            .array(
                z.object({
                    amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                })
            )
            .min(1, { message: 'At least one Student must be selected' })
    })
    .superRefine((data, ctx) => {
        const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
        if (new Set(studentIds).size !== studentIds.length) {
            ctx.addIssue({
                path: ['studentList'],
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Students are not allowed'
            });
        }
    });

export type SophiaProgressReportPreIISchema = z.infer<typeof sophiaProgressReportPreIISchema>;

export const sophiaTopperListReportSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    emcA_Id: z.number({ required_error: 'Category is required' }).min(1, { message: 'Please select Category' }),
    asmcL_Id: z.number({ required_error: 'Class Name is required' }).min(1, { message: 'Please select Class Name' }),
    emE_Id: z.number({ required_error: 'Exam Name is required' }).min(1, { message: 'Please select Exam Name' }),
    asmS_Id: z.number({ required_error: 'Section Name is required' }).min(1, { message: 'Please select Section Name' })
});

export type SophiaTopperListReportSchema = z.infer<typeof sophiaTopperListReportSchema>;

export const stJamesConsolidateReportSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class Name is required' }).min(1, { message: 'Please select Class Name' }),
    asmS_Id: z.number({ required_error: 'Section Name is required' }).min(1, { message: 'Please select Section Name' })
});

export type StJamesConsolidateReportSchema = z.infer<typeof stJamesConsolidateReportSchema>;

export const stJamesIX_XReportSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class Name is required' }).min(1, { message: 'Please select Class Name' }),
    asmS_Id: z.number({ required_error: 'Section Name is required' }).min(1, { message: 'Please select Section Name' }),
    reporttype: z.enum(['indi', 'groupwise'], { required_error: 'Type is required' }),
    displayAttendance: z.boolean().default(true),
    emE_Id: z
        .array(
            z.object({
                emE_Id: z.number({ required_error: 'Exam is required' }).min(1, { message: 'Please select Exam' })
            })
        )
        .min(1, { message: 'At least one Exam must be selected' })
});
export type StJamesIX_XReportSchema = z.infer<typeof stJamesIX_XReportSchema>;

export const ndsCoScholasticReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type NDSCoScholasticReportSchema = z.infer<typeof ndsCoScholasticReportSchema>;

export const gmvpsProgressCardIXSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    date: z.string().min(1, 'Date is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type GmvpsProgressCardIXSchema = z.infer<typeof gmvpsProgressCardIXSchema>;

export const burnpurProgressCardXIISchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    date: z.string().min(1, 'Date is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type BurnpurProgressCardXIISchema = z.infer<typeof burnpurProgressCardXIISchema>;

export const burnpurProgressCardXISchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    date: z.string().min(1, 'Date is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type BurnpurProgressCardXISchema = z.infer<typeof burnpurProgressCardXISchema>;

export const finalNdasReportCardSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    date: z.string().min(1, 'Date is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type FinalNdasReportCardSchema = z.infer<typeof finalNdasReportCardSchema>;

export const ndasReportCardTermSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type NdasReportCardTermSchema = z.infer<typeof ndasReportCardTermSchema>;

export const promotionReportCardSophiaSchema = z.object({
    mI_Id: z.number().optional(),
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
    asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
    from_date: z.date({ required_error: 'From Date is required' }),
    to_date: z.date({ required_error: 'To Date is required' }),
    studentList: z
        .array(
            z.object({
                amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Student' })
            })
        )
        .min(1, { message: 'At least one Student must be selected' })
});

export type PromotionReportCardSophiaSchema = z.infer<typeof promotionReportCardSophiaSchema>;

export const stJamesNurseryReportSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class Name is required' }).min(1, { message: 'Please select Class Name' }),
    asmS_Id: z.number({ required_error: 'Section Name is required' }).min(1, { message: 'Please select Section Name' }),
    emE_Id: z.number({ required_error: 'Exam is required' }).min(1, { message: 'Please select Exam' }),
    readmit: z.boolean().default(false),
    displayattendance: z.boolean().default(false)
});

export type StJamesNurseryReportSchema = z.infer<typeof stJamesNurseryReportSchema>;

export const stJamesTransitionReportSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class Name is required' }).min(1, { message: 'Please select Class Name' }),
    asmS_Id: z.number({ required_error: 'Section Name is required' }).min(1, { message: 'Please select Section Name' }),
    emE_Id: z.number({ required_error: 'Exam is required' }).min(1, { message: 'Please select Exam' }),
    readmit: z.boolean().default(false),
    displayattendance: z.boolean().default(false)
});

export type StJamesTransitionReportSchema = z.infer<typeof stJamesTransitionReportSchema>;

export const stJamesI_IIIReportSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class Name is required' }).min(1, { message: 'Please select Class Name' }),
    asmS_Id: z.number({ required_error: 'Section Name is required' }).min(1, { message: 'Please select Section Name' }),
    emE_Id: z.number({ required_error: 'Exam is required' }).min(1, { message: 'Please select Exam' }),
    readmit: z.boolean().default(false),
    displayattendance: z.boolean().default(false),
    displayMarks: z.boolean().default(false)
});

export type StJamesI_IIIReportSchema = z.infer<typeof stJamesI_IIIReportSchema>;

export const stJamesConsolidatedPointsReportSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class Name is required' }).min(1, { message: 'Please select Class Name' }),
    asmS_Id: z.number({ required_error: 'Section Name is required' }).min(1, { message: 'Please select Section Name' }),
    StjamesPoints: z.boolean().default(true)
});

export type StJamesConsolidatedPointsReportSchema = z.infer<typeof stJamesConsolidatedPointsReportSchema>;

export const calcuttaPromotionReportItoIVSchema = z
    .object({
        mI_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
        empG_GroupName: z.string().optional(), // Term
        studentList: z
            .array(
                z.object({
                    amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                })
            )
            .min(1, { message: 'At least one Student must be selected' })
    })
    .superRefine((data, ctx) => {
        const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
        if (new Set(studentIds).size !== studentIds.length) {
            ctx.addIssue({
                path: ['studentList'],
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Students are not allowed'
            });
        }
    });

export type CalcuttaPromotionReportItoIVSchema = z.infer<typeof calcuttaPromotionReportItoIVSchema>;

export const rainbowProgressCardReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    empsG_PercentValue: z
        .string()
        .min(1, 'Percentage is required')
        .regex(/^(100|[1-9]?[0-9])$/, 'Please enter a value between 0 and 100'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type RainbowProgressCardReportSchema = z.infer<typeof rainbowProgressCardReportSchema>;

export const hhsReportPreparatorySchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    AMST_Id: z.string().min(1, 'Student is required'),
    EMGR_Id: z.string().min(1, 'Grade Group is required'),
    re_opendate: z.coerce.date().optional()
});

export type HHSReportPreparatorySchema = z.infer<typeof hhsReportPreparatorySchema>;

export const hhsIIVReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    AMST_Id: z.string().min(1, 'Student is required'),
    EMGR_Id: z.string().min(1, 'Grade Group is required'),
    re_opendate: z.coerce.date().optional()
});

export type HHSIIVReportSchema = z.infer<typeof hhsIIVReportSchema>;

export const gmvpsPromotionReportCardSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    performanceanalysis: z.boolean().default(true),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student'),
    date: z.coerce.date().optional()
});

export type GmvpsPromotionReportCardSchema = z.infer<typeof gmvpsPromotionReportCardSchema>;

export const calcuttaPromotionReportItoIXSchema = z
    .object({
        mI_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
        allTerm: z.boolean().default(false),
        empG_GroupName: z.string().optional(),
        studentList: z
            .array(
                z.object({
                    amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                })
            )
            .min(1, { message: 'At least one Student must be selected' })
    })
    .superRefine((data, ctx) => {
        if (!data.allTerm && !data.empG_GroupName) {
            ctx.addIssue({
                path: ['empG_GroupName'],
                code: z.ZodIssueCode.custom,
                message: 'Term is required when All Term is not selected'
            });
        }
        const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
        if (new Set(studentIds).size !== studentIds.length) {
            ctx.addIssue({
                path: ['studentList'],
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Students are not allowed'
            });
        }
    });

export type CalcuttaPromotionReportItoIXSchema = z.infer<typeof calcuttaPromotionReportItoIXSchema>;

export const calcuttaPromotionReportItoVSchema = z
    .object({
        mI_Id: z.number().optional(),
        asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
        asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
        academicDate: z.date({ required_error: 'New Academic Date is required' }),
        reportPrintedDate: z.date().optional(),
        issueDate: z.date({ required_error: 'Issue Date is required' }),
        studentList: z
            .array(
                z.object({
                    amsT_Id: z.number({ required_error: 'Student is required' }).min(1, { message: 'Please select a Students' })
                })
            )
            .min(1, { message: 'At least one Student must be selected' })
    })
    .superRefine((data, ctx) => {
        const studentIds = data.studentList?.map((s) => s.amsT_Id) || [];
        if (new Set(studentIds).size !== studentIds.length) {
            ctx.addIssue({
                path: ['studentList'],
                code: z.ZodIssueCode.custom,
                message: 'Duplicate Students are not allowed'
            });
        }
    });

export type CalcuttaPromotionReportItoVSchema = z.infer<typeof calcuttaPromotionReportItoVSchema>;

export const multipleExamCumulativeReportCalcuttaSchema = z.object({
    asmaY_Id: z.number({ required_error: 'Academic Year is required' }).min(1, { message: 'Please select Academic Year' }),
    asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, { message: 'Please select Class' }),
    asmS_Id: z.number({ required_error: 'Section is required' }).min(1, { message: 'Please select Section' }),
    emgR_Id: z.number({ required_error: 'Grade is required' }).min(1, { message: 'Please select Grade' }),
    examlist: z
        .array(
            z.object({
                emE_Id: z.number()
            })
        )
        .min(1, { message: 'Please select at least one Exam' }),
    empsG_PercentValue: z.number().optional().default(0),
    flag: z.string().optional().default('4'),
    emE_Id: z.number().optional().default(0),
    reporttype: z.string().optional().default(''),
    empG_GroupName: z.string().optional().default('')
});

export type MultipleExamCumulativeReportCalcuttaValues = z.infer<typeof multipleExamCumulativeReportCalcuttaSchema>;

export const finalPromReportSTMarySchema = z.object({
    ASMAY_Id: z.string({ required_error: 'Academic Year is required' }).min(1, 'Academic Year is required'),
    ASMCL_Id: z.string({ required_error: 'Class is required' }).min(1, 'Class is required'),
    ASMS_Id: z.string({ required_error: 'Section is required' }).min(1, 'Section is required'),
    date: z.string({ required_error: 'Reopen Date is required' }).min(1, 'Reopen Date is required'),
    remarks: z.string({ required_error: 'Promoted to std is required' }).min(1, 'Promoted to std is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type FinalPromReportSTMarySchema = z.infer<typeof finalPromReportSTMarySchema>;

export const baldwinReportSchema = z.object({
    ASMAY_Id: z.string({ required_error: 'Academic Year is required' }).min(1, 'Academic Year is required'),
    ASMCL_Id: z.string({ required_error: 'Class is required' }).min(1, 'Class is required'),
    ASMS_Id: z.string({ required_error: 'Section is required' }).min(1, 'Section is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student'),
    workingDays: z.string().optional().default(''),
    presentDays: z.string().optional().default(''),
    includeLeftStudents: z.boolean().default(false),
    dontShowRank: z.boolean().default(true),
    printLogo: z.boolean().default(true),
    left_logo: z.boolean().default(true),
    right_logo: z.boolean().default(true)
});

export type BaldwinReportSchema = z.infer<typeof baldwinReportSchema>;

export const finalPromReportChinmayI_IXSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    OverAlltotal: z.boolean().default(false),
    OverAlClass: z.boolean().default(false),
    ECTEX_NotApplToTotalFlg: z.boolean().default(false),
    reopen_date: z.string().min(1, 'Reopen Date is required'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export const tbs_reportIXtoXSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedStudents: z.array(z.string()).min(1, 'Select at least one student')
});

export type TBSReportIXtoXSchema = z.infer<typeof tbs_reportIXtoXSchema>;

export const multipleProgressCardReportSchema = z.object({
    ASMAY_Id: z.string().min(1, 'Select Academic Year'),
    ASMCL_Id: z.string().min(1, 'Select Class'),
    ASMS_Id: z.string().min(1, 'Select Section'),
    selectedExams: z.array(z.string()).min(1, 'Select at least one exam'),
    showAttendance: z.boolean().default(true)
});

export type MultipleProgressCardReportSchema = z.infer<typeof multipleProgressCardReportSchema>;

export const hhsReport5to7Schema = z.object({
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().min(1, 'Section is required'),
    AMST_Id: z.string().min(1, 'Student Name is required'),
    EMGR_Id: z.string().min(1, 'Grade is required'),
    re_opendate: z.coerce.date().optional()
});

export type HHSReport5to7Schema = z.infer<typeof hhsReport5to7Schema>;
