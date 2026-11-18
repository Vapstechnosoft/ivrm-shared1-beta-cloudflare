import { z } from 'zod';
import { createAlphaNumericSpaceSchema, createStringOnlySchema } from '../validationSchemas';

/**
 * HRMS Masters Zod Schemas
 * Converted from React Hook Form validation objects to Zod schemas
 * Following the pattern from preadmission module
 */

// Bank Master Schema
export const bankMasterSchema = z.object({
    hrmbD_Id: z.number().optional(),
    hrmbD_BankName: z
        .string({ message: 'Bank Name is required' })
        .min(3, { message: 'Bank Name must be at least 3 characters' })
        .max(50, { message: 'Bank Name must not exceed 50 characters' })
        .regex(/^[A-Za-z\s.]+$/, {
            message: 'Bank Name must contain only alphabets'
        })
        .refine((value) => value.trim() === value, {
            message: 'Bank Name cannot have leading or trailing spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Bank Name must contain at least one alphabet character'
            }
        ),
    hrmbD_BranchName: z
        .string({ message: 'Branch Name is required' })
        .min(3, { message: 'Branch Name must be at least 3 characters' })
        .max(50, { message: 'Branch Name must not exceed 50 characters' })
        .regex(/^[A-Za-z0-9\s/\-.]+$/, {
            message: 'Branch Name must contain only alphabets, numbers, spaces, /, -, and periods (.)'
        })
        .refine((value) => value.trim() === value, {
            message: 'Branch Name cannot have leading or trailing spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Branch Name must contain at least one alphabet character'
            }
        ),
    hrmbD_BankAccountNo: z
        .string({ message: 'Account Number is required' })
        .min(9, { message: 'Account Number must be at least 9 digits' })
        .max(18, { message: 'Account Number must not exceed 18 digits' })
        .regex(/^[1-9][0-9]{8,17}$/, {
            message: 'Account Number must be numeric, 9-18 digits, and cannot start with 0'
        }),
    hrmbD_IFSCCode: z
        .string({ message: 'IFSC Code is required' })
        .length(11, { message: 'IFSC Code must be exactly 11 characters (e.g., SBIN0000123)' })
        .regex(/^[A-Z]{4}0[0-9]{6}$/, {
            message: 'Enter valid IFSC Code (e.g., SBIN0000123)'
        }),
    hrmbD_BankAddress: z
        .string()
        .max(250, { message: 'Bank Address must not exceed 250 characters' })
        .regex(/^[A-Za-z0-9\s,/\-.]+$/, {
            message: 'Invalid characters in Bank Address. Only alphanumeric, commas, /, -, and periods (.) allowed'
        })
        .refine(
            (value) => {
                if (!value) return true;
                const trimmed = value.trim();
                return trimmed.length === 0 || /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Bank Address must contain at least one alphabet character if provided'
            }
        )
        .optional()
        .or(z.literal('')),
    hrmbD_ActiveFlag: z.boolean().default(true)
});

// Department Master Schema
export const departmentMasterSchema = z.object({
    hrmD_Id: z.number().optional(),
    hrmD_DepartmentName: createStringOnlySchema('Department Name', 1, 50).refine(
        (value) => {
            const trimmed = value.trim();
            return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
        },
        {
            message: 'Department Name must contain at least one alphabet character'
        }
    ),
    hrmD_InternalTrainingMinimumHrs: z
        .union([
            z.number({
                invalid_type_error: 'Internal Training Minimum Hours is required',
                required_error: 'Internal Training Minimum Hours is required'
            }),
            z.string().transform((val) => {
                const parsed = Number.parseInt(val, 10);
                return Number.isNaN(parsed) ? undefined : parsed;
            })
        ])
        .transform((val) => val)
        .refine((val) => val !== undefined && val !== null && !Number.isNaN(val), {
            message: 'Internal Training Minimum Hours is required'
        })
        .refine((val) => (val as number) >= 0, {
            message: 'Internal Training Minimum Hours must be a positive number or zero'
        })
        .refine((val) => (val as number) <= 999, {
            message: 'Internal Training Minimum Hours must not exceed 999'
        }),
    hrmD_Order: z.number().optional()
});

// Designation Master Schema
export const designationMasterSchema = z.object({
    hrmdeS_Id: z.number().optional(),
    hrmdeS_DesignationName: createStringOnlySchema('Designation Name', 1, 50).refine(
        (value) => {
            const trimmed = value.trim();
            return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
        },
        {
            message: 'Designation Name must contain at least one alphabet character'
        }
    ),
    hrmdeS_SanctionedSeats: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? Number.parseInt(val, 10) : val))
        .refine((val) => !Number.isNaN(val) && val >= 0, {
            message: 'Sanctioned Seats must be a positive number or zero'
        })
        .optional(),
    hrmdeS_BasicAmount: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? Number.parseFloat(val) : val))
        .refine((val) => !Number.isNaN(val) && val >= 0, {
            message: 'Basic Amount must be a positive number or zero'
        })
        .refine((val) => val <= 9999999999, {
            message: 'Basic Amount must not exceed 10 digits'
        })
        .optional(),
    hrmdeS_DisplaySanctionedSeatsFlag: z.boolean().optional(),
    hrmdeS_Order: z.number().optional()
});

// Group Type Master Schema
export const groupTypeMasterSchema = z.object({
    hrmgT_Id: z.number().optional(),
    hrmgT_EmployeeGroupType: createStringOnlySchema('Group Type', 1, 50).refine(
        (value) => {
            const trimmed = value.trim();
            return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
        },
        {
            message: 'Group Type must contain at least one alphabet character'
        }
    ),
    hrmgT_Code: z
        .string({ message: 'Group Code is required' })
        .max(20, { message: 'Group Code must not exceed 20 characters' })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Group Code must contain at least one alphabet character'
            }
        ),
    hrmgT_Order: z.number().optional()
});

// Grade Master Schema
export const gradeMasterSchema = z
    .object({
        hrmG_Id: z.number().optional(),
        hrmG_GradeName: createStringOnlySchema('Grade Name', 1, 50).refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Grade Name must contain at least one alphabet character'
            }
        ),
        hrmG_GradeDisplayName: createStringOnlySchema('Grade Display Name', 1, 50).refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Grade Display Name must contain at least one alphabet character'
            }
        ),
        hrmG_PayScaleFrom: z
            .union([
                z.number({ invalid_type_error: 'Pay Scale From is required', required_error: 'Pay Scale From is required' }),
                z.string().transform((val) => {
                    const parsed = Number.parseFloat(val);
                    return Number.isNaN(parsed) ? undefined : parsed;
                })
            ])
            .transform((val) => val)
            .refine((val) => val !== undefined && val !== null && !Number.isNaN(val), {
                message: 'Pay Scale From is required'
            })
            .refine((val) => (val as number) >= 0 && (val as number) <= 999999, {
                message: 'Pay Scale From must be between 0 and 999999'
            }),
        hrmG_PayScaleTo: z
            .union([
                z.number({ invalid_type_error: 'Pay Scale To is required', required_error: 'Pay Scale To is required' }),
                z.string().transform((val) => {
                    const parsed = Number.parseFloat(val);
                    return Number.isNaN(parsed) ? undefined : parsed;
                })
            ])
            .transform((val) => val)
            .refine((val) => val !== undefined && val !== null && !Number.isNaN(val), {
                message: 'Pay Scale To is required'
            })
            .refine((val) => (val as number) >= 0 && (val as number) <= 999999, {
                message: 'Pay Scale To must be between 0 and 999999'
            }),
        hrmG_IncrementOf: z
            .union([
                z.number({ invalid_type_error: 'Increment is required', required_error: 'Increment is required' }),
                z.string().transform((val) => {
                    const parsed = Number.parseFloat(val);
                    return Number.isNaN(parsed) ? undefined : parsed;
                })
            ])
            .transform((val) => val)
            .refine((val) => val !== undefined && val !== null && !Number.isNaN(val), {
                message: 'Increment is required'
            })
            .refine((val) => (val as number) >= 0 && (val as number) <= 999999, {
                message: 'Increment must be between 0 and 999999'
            }),
        hrmG_Order: z.number().optional()
    })
    .refine(
        (data) => {
            // Pay Scale To must be greater than Pay Scale From
            // Handle edge cases where values might be undefined
            if (data.hrmG_PayScaleFrom === undefined || data.hrmG_PayScaleTo === undefined) return true;
            return data.hrmG_PayScaleTo >= data.hrmG_PayScaleFrom;
        },
        {
            message: 'Pay Scale To must be greater than Pay Scale From',
            path: ['hrmG_PayScaleTo']
        }
    );

// Grade Master Schema (Alphanumeric with Spaces - accepts letters, numbers, and spaces)
export const gradeMasterAlphanumericSchema = z
    .object({
        hrmG_Id: z.number().optional(),
        hrmG_GradeName: createAlphaNumericSpaceSchema('Grade Name', 1, 50).refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0;
            },
            {
                message: 'Grade Name cannot be empty or contain only spaces'
            }
        ),
        hrmG_GradeDisplayName: createAlphaNumericSpaceSchema('Grade Display Name', 1, 50).refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0;
            },
            {
                message: 'Grade Display Name cannot be empty or contain only spaces'
            }
        ),
        hrmG_PayScaleFrom: z
            .union([
                z.number({ invalid_type_error: 'Pay Scale From is required', required_error: 'Pay Scale From is required' }),
                z.string().transform((val) => {
                    const parsed = Number.parseFloat(val);
                    return Number.isNaN(parsed) ? undefined : parsed;
                })
            ])
            .transform((val) => val)
            .refine((val) => val !== undefined && val !== null && !Number.isNaN(val), {
                message: 'Pay Scale From is required'
            })
            .refine((val) => (val as number) >= 0 && (val as number) <= 999999, {
                message: 'Pay Scale From must be between 0 and 999999'
            }),
        hrmG_PayScaleTo: z
            .union([
                z.number({ invalid_type_error: 'Pay Scale To is required', required_error: 'Pay Scale To is required' }),
                z.string().transform((val) => {
                    const parsed = Number.parseFloat(val);
                    return Number.isNaN(parsed) ? undefined : parsed;
                })
            ])
            .transform((val) => val)
            .refine((val) => val !== undefined && val !== null && !Number.isNaN(val), {
                message: 'Pay Scale To is required'
            })
            .refine((val) => (val as number) >= 0 && (val as number) <= 999999, {
                message: 'Pay Scale To must be between 0 and 999999'
            }),
        hrmG_IncrementOf: z
            .union([
                z.number({ invalid_type_error: 'Increment is required', required_error: 'Increment is required' }),
                z.string().transform((val) => {
                    const parsed = Number.parseFloat(val);
                    return Number.isNaN(parsed) ? undefined : parsed;
                })
            ])
            .transform((val) => val)
            .refine((val) => val !== undefined && val !== null && !Number.isNaN(val), {
                message: 'Increment is required'
            })
            .refine((val) => (val as number) >= 0 && (val as number) <= 999999, {
                message: 'Increment must be between 0 and 999999'
            }),
        hrmG_Order: z.number().optional()
    })
    .refine(
        (data) => {
            // Pay Scale To must be greater than Pay Scale From
            // Handle edge cases where values might be undefined
            if (data.hrmG_PayScaleFrom === undefined || data.hrmG_PayScaleTo === undefined) return true;
            return data.hrmG_PayScaleTo > data.hrmG_PayScaleFrom;
        },
        {
            message: 'Pay Scale To must be greater than Pay Scale From',
            path: ['hrmG_PayScaleTo']
        }
    );

// Gender Master Schema
export const genderMasterSchema = z.object({
    ivrmmG_Id: z.number().optional(),
    ivrmmG_GenderName: createStringOnlySchema('Gender Name', 1, 50).refine(
        (value) => {
            const trimmed = value.trim();
            return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
        },
        {
            message: 'Gender Name must contain at least one alphabet character'
        }
    )
});

// Leave Year Master Schema
export const leaveYearMasterSchema = z
    .object({
        hrmlY_Id: z.number().optional(),
        hrmlY_LeaveYear: z
            .string({ message: 'Leave Year is required' })
            .min(4, { message: 'Leave Year must be 4 digits' })
            .max(4, { message: 'Leave Year must be 4 digits' })
            .regex(/^\d{4}$/, {
                message: 'Leave Year must be a 4-digit number'
            }),
        hrmlY_FromDate: z.string({ message: 'From Date is required' }).min(1, { message: 'From Date is required' }),
        hrmlY_ToDate: z.string({ message: 'To Date is required' }).min(1, { message: 'To Date is required' })
    })
    .refine(
        (data) => {
            if (!data.hrmlY_FromDate || !data.hrmlY_ToDate) return true;
            const from = new Date(data.hrmlY_FromDate);
            const to = new Date(data.hrmlY_ToDate);
            from.setHours(0, 0, 0, 0);
            to.setHours(0, 0, 0, 0);
            return to > from;
        },
        {
            message: 'To Date must be greater than From Date',
            path: ['hrmlY_ToDate']
        }
    );

// Loan Type Master Schema
export const loanTypeMasterSchema = z.object({
    hrmlN_Id: z.number().optional(),
    hrmL_LoanType: z
        .string({ message: 'Loan Type is required' })
        .min(1, { message: 'Loan Type must be at least 1 character' })
        .max(50, { message: 'Loan Type must not exceed 50 characters' })
        .regex(/^[A-Za-z\s]+$/, {
            message: 'Loan Type must contain only alphabetic characters and spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Loan Type must contain at least one alphabet character'
            }
        ),
    hrmL_Max: z
        .number({ message: 'Maximum Amount is required' })
        .min(1, { message: 'Maximum Amount must be greater than 0' })
        .refine((val) => val <= 9999999999, {
            message: 'Maximum Amount must not exceed 10 digits'
        })
});

// Marital Status Master Schema
export const maritalStatusMasterSchema = z.object({
    ivrmmmS_Id: z.number().optional(),
    ivrmmmS_MaritalStatus: z
        .string({ message: 'Marital Status is required' })
        .min(2, { message: 'Marital Status must be at least 2 characters' })
        .max(50, { message: 'Marital Status must not exceed 50 characters' })
        .regex(/^[A-Za-z\s]+$/, {
            message: 'Marital Status must contain only alphabetic characters and spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Marital Status must contain at least one alphabet character'
            }
        )
});

// Employee Type Master Schema
export const employeeTypeMasterSchema = z.object({
    hrmeT_Id: z.number().optional(),
    hrmeT_EmployeeType: z
        .string({ message: 'Employee Type is required' })
        .min(1, { message: 'Employee Type must be at least 1 character' })
        .max(50, { message: 'Employee Type must not exceed 50 characters' })
        .regex(/^[A-Za-z\s]+$/, {
            message: 'Employee Type must contain only alphabetic characters and spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Employee Type must contain at least one alphabet character'
            }
        )
});

// Specialization Master Schema
export const specializationMasterSchema = z.object({
    hrmspL_Id: z.number().optional(),
    hrmspL_SpecialisationName: z
        .string({ message: 'Specialization Name is required' })
        .min(1, { message: 'Specialization Name must be at least 1 character' })
        .max(50, { message: 'Specialization Name must not exceed 50 characters' })
        .regex(/^[A-Za-z\s]+$/, {
            message: 'Specialization Name must contain only alphabetic characters and spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Specialization Name must contain at least one alphabet character'
            }
        )
});

// Professional Tax Master Schema
export const professionalTaxMasterSchema = z
    .object({
        hrmpT_Id: z.number().optional(),
        hrmpT_SalaryFrom: z
            .number({ message: 'Salary From is required' })
            .min(0, { message: 'Salary From must be 0 or greater' })
            .refine((val) => val <= 9999999999, {
                message: 'Salary From must not exceed 10 digits'
            }),
        hrmpT_SalaryTo: z
            .number({ message: 'Salary To is required' })
            .min(0, { message: 'Salary To must be 0 or greater' })
            .refine((val) => val <= 9999999999, {
                message: 'Salary To must not exceed 10 digits'
            }),
        hrmpT_PTax: z
            .number({ message: 'Professional Tax is required' })
            .min(0, { message: 'Professional Tax must be 0 or greater' })
            .refine((val) => val <= 9999999999, {
                message: 'Professional Tax must not exceed 10 digits'
            })
    })
    .refine(
        (data) => {
            return data.hrmpT_SalaryFrom < data.hrmpT_SalaryTo;
        },
        {
            message: 'Salary From must be less than Salary To',
            path: ['hrmpT_SalaryTo']
        }
    );

// Course/Qualification Master Schema
export const courseMasterSchema = z.object({
    hrmC_Id: z.number().optional(),
    hrmC_QulaificationName: z
        .string({ message: 'Qualification Name is required' })
        .max(100, { message: 'Qualification Name must not exceed 100 characters' })
        .regex(/^[A-Za-z0-9.\s]+$/, {
            message: 'Qualification Name must contain only alphanumeric characters and spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Qualification Name must contain at least one alphabet character'
            }
        ),
    hrmC_QualificationDesc: z
        .string({ message: 'Qualification Description is required' })
        .min(3, { message: 'Qualification Description must be at least 3 characters' })
        .max(150, { message: 'Qualification Description must not exceed 150 characters' })
        .regex(/^[A-Za-z0-9\s]+$/, {
            message: 'Qualification Description must contain only alphanumeric characters and spaces'
        })
        .refine(
            (value) => {
                const trimmed = value.trim();
                return trimmed.length > 0 && /[A-Za-z]/.test(trimmed);
            },
            {
                message: 'Qualification Description must contain at least one alphabet character'
            }
        ),
    hrmC_SpecialisationFlag: z.boolean().default(false),
    hrmC_DefaultQualFag: z.boolean().default(false),
    hrmC_ActiveFlag: z.boolean().optional(),
    hrmC_Order: z.number().optional()
});

// Payroll Standard Master Schema
export const payrollStandardSchema = z.object({
    HRC_Id: z.number().optional(),
    // Provident Fund
    HRC_PFAccPrefix: z.string().min(1, 'Account Prefix is required'),
    HRC_PFMaxAmt: z.number({ required_error: 'PF Max Amount is required' }).min(0, 'Cannot be negative'),
    HRC_FPFPer: z
        .number()
        .min(0)
        .max(100)
        .refine((val) => !val || Number.isInteger(val * 100), 'Max 2 decimal places allowed')
        .optional()
        .or(z.literal(undefined)),
    HRC_EPFPer: z
        .number()
        .min(0)
        .max(100)
        .refine((val) => !val || Number.isInteger(val * 100), 'Max 2 decimal places allowed')
        .optional()
        .or(z.literal(undefined)),
    HRC_EPFPerAfterRetirement: z.number().min(0).max(100).optional(),
    HRC_EPFPerAfterRetirement2: z.number().min(0).max(100).optional(),
    HRC_AccNo2Per: z.number().min(0).optional(), // Account number, not percentage
    HRC_AccNo21Per: z.number().min(0).optional(), // Account number, not percentage
    HRC_AccNo22Per: z.number().min(0).optional(), // Account number, not percentage
    HRC_AC2MinAmt: z.number().min(0).optional(),
    HRC_AC21MinAmt: z.number().min(0).optional(),
    HRC_AC22MinAmt: z.number().min(0).optional(),
    HRC_EducationCess: z.number().min(0).optional(),
    HRC_PartAMaxLimit: z.number().min(0).optional(),
    HRC_PartBMaxLimit: z.number().min(0).optional(),
    HRC_AsPerEmployee: z.boolean().optional(),
    HRC_RetirementYrs: z.number().min(1).max(99),
    // ESI
    HRC_ESIAccPrefix: z.string().min(1, 'ESI Account Prefix Required'),
    HRC_ESIMax: z
        .number()
        .min(0, 'Must be at least 0')
        .max(100, 'Cannot exceed 100')
        .refine((val) => !val || Number.isInteger(val * 100), 'Max 2 decimal places allowed')
        .optional()
        .or(z.literal(undefined)),
    HRC_ESIMaxAmount: z.number().min(0).optional().or(z.literal(undefined)),
    HRC_ESIEmplrCont: z.number().min(0).max(100).optional().or(z.literal(undefined)),
    // Arrear Details
    HRC_ArrearSalaryReport: z.enum(['Separate', 'OnlyArrearHead'], { required_error: 'Arrear Salary Report is required' }),
    HRC_ArrearRequired: z.enum(['Cumulative', 'Monthwise']).optional(),
    // Approval Process
    HRC_SalaryApproval: z.boolean().optional(),
    HRC_SalaryAdvance: z.boolean().optional(),
    HRC_Loan: z.boolean().optional(),
    HRC_Leave: z.boolean().optional(),
    HRC_Increment: z.boolean().optional(),
    HRC_Probation: z.boolean().optional(),
    // Payment Method
    HRC_PaymentMethod: z.number({ required_error: 'Payment Method is required' }).min(1).max(6),
    // Increment Process
    HRC_OptionalHolidays: z.number().min(0).optional(),
    HRC_ApplicableFlag: z.boolean().optional(),
    HRC_MinimumPeriods: z.number().min(0).optional(),
    HRC_IncrementMonth: z.string({ message: 'Increment Month is required' }).min(1, 'Increment Month is required'),
    HRC_IncrementOnceInMonths: z.number().min(0).optional(),
    HRC_AlertDays: z.number().min(0).optional(),
    // Salary Days
    HRC_SalaryFromDay: z.coerce.number({ required_error: 'Salary From Day is required' }).min(1, 'Salary From Day is required').max(31),
    HRC_SalaryToDay: z.coerce.number({ required_error: 'Salary To Day is required' }).min(1, 'Salary To Day is required').max(31),
    HRC_ActiveFlag: z.boolean()
});

// Group-Department-Designation Mapping Schema
export const groupDeptDessgMappingSchema = z.object({
    hrgtddS_Id: z.number().optional(),
    hrmgT_Id: z.string().min(1, 'Please select a group type'),
    hrmD_Id: z.string().min(1, 'Please select a department'),
    hrmdeS_Id: z.number().optional(),
    designationids: z.array(z.number()).min(1, 'Please select at least one designation'),
    hrgtddS_ActiveFlg: z.boolean().default(true),
    hrgtddS_CreatedBy: z.number().optional(),
    logInUserId: z.number().optional()
});

// Religion-Category Mapping Schema
export const religionCategoryMappingSchema = z.object({
    IMRCC_Id: z.number().optional(),
    IVRMMR_Id: z.number().min(1, 'Please select a religion'),
    IMCC_Id: z.number().optional(),
    categoryids: z.array(z.number()).min(1, 'Please select at least one category'),
    IMRCC_ActiveFlag: z.boolean().default(true),
    IMRCC_CreatedBy: z.number().optional(),
    LogInUserId: z.number().optional()
});

// Export schemas as objects matching the pattern from preadmission
export const hrmsMasterSchemas = {
    bank: {
        add: bankMasterSchema,
        update: bankMasterSchema
    },
    department: {
        add: departmentMasterSchema,
        update: departmentMasterSchema
    },
    designation: {
        add: designationMasterSchema,
        update: designationMasterSchema
    },
    employeeType: {
        add: employeeTypeMasterSchema,
        update: employeeTypeMasterSchema
    },
    groupType: {
        add: groupTypeMasterSchema,
        update: groupTypeMasterSchema
    },
    grade: {
        add: gradeMasterAlphanumericSchema,
        update: gradeMasterAlphanumericSchema
    },
    gender: {
        add: genderMasterSchema,
        update: genderMasterSchema
    },
    loanType: {
        add: loanTypeMasterSchema,
        update: loanTypeMasterSchema
    },
    maritalStatus: {
        add: maritalStatusMasterSchema,
        update: maritalStatusMasterSchema
    },
    course: {
        add: courseMasterSchema,
        update: courseMasterSchema
    },
    leaveYear: {
        add: leaveYearMasterSchema,
        update: leaveYearMasterSchema
    },
    professionalTax: {
        add: professionalTaxMasterSchema,
        update: professionalTaxMasterSchema
    },
    specialization: {
        add: specializationMasterSchema,
        update: specializationMasterSchema
    },
    payrollStandard: {
        add: payrollStandardSchema,
        update: payrollStandardSchema
    },
    groupDeptDessgMapping: {
        addOrUpdate: groupDeptDessgMappingSchema
    },
    religionCategoryMapping: {
        addOrUpdate: religionCategoryMappingSchema
    },
    loan: {
        add: loanTypeMasterSchema,
        update: loanTypeMasterSchema
    },
    // Attendance Management Masters
    masterHoliday: {
        add: z
            .object({
                day_flag: z.boolean().default(true),
                selectedDaysDate: z
                    .array(
                        z.object({
                            date: z.string(),
                            dayname: z.string()
                        })
                    )
                    .optional(),
                fO_Start_Date: z.string().optional(),
                fomhwdD_ToDate: z.string().optional(),
                fomhwD_HolidayWDName: z.string().optional(),
                fO_Remark: z.string().optional(),
                fohwdT_Id: z.coerce.number().min(1, 'Holiday Type is required'),
                hrmlY_Id: z.coerce.number().min(1, 'Leave Year is required'),
                hrmD_Id: z.coerce.number().optional(),
                // UI fields for form tracking
                calendarYear: z.string().optional(),
                selectedDays: z.array(z.string()).optional()
            })
            .superRefine((data, ctx) => {
                if (data.day_flag) {
                    if (!data.selectedDays || data.selectedDays.length === 0) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Please select at least one day',
                            path: ['selectedDays']
                        });
                    }

                    // Only validate selectedDaysDate if days are selected to avoid duplicate errors
                    if (data.selectedDays && data.selectedDays.length > 0) {
                        if (!data.selectedDaysDate || data.selectedDaysDate.length === 0) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: 'Please select at least one date from the list below',
                                path: ['selectedDaysDate']
                            });
                        }
                    }
                } else {
                    if (!data.fO_Start_Date) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Start Date is required',
                            path: ['fO_Start_Date']
                        });
                    }

                    if (!data.fomhwdD_ToDate) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'End Date is required',
                            path: ['fomhwdD_ToDate']
                        });
                    }
                    if (!data.fomhwD_HolidayWDName) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Holiday Name is required',
                            path: ['fomhwD_HolidayWDName']
                        });
                    }
                    if (!data.fO_Remark) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Remark is required',
                            path: ['fO_Remark']
                        });
                    }
                }
            }),
        update: z.object({
            fomhwD_Id: z.number(),
            calendarYear: z.string().min(1, 'Calendar Year is required'),
            fomhwD_Department: z.string().optional(),
            fomhwD_HolidayType: z.string().min(1, 'Holiday Type is required'),
            selectedDays: z.array(z.string()).optional(),
            fomhwD_FromDate: z.string().optional(),
            fomhwD_ToDate: z.string().optional(),
            fomhwD_Name: z.string().optional(),
            fomhwD_Remarks: z.string().optional()
        }),
        delete: z.object({
            fomhwdD_Id: z.coerce
                .number()
                .int({ message: 'fomhwdD_Id is required' })
                .min(1, { message: 'fomhwdD_Id must be greater than 0' })
        })
    },
    shiftSettingMaster: {
        add: z.object({
            foms_ShiftName: z.string().min(1, 'Shift Name is required').max(100),
            fomsT_IHalfLoginTime: z
                .string({ required_error: 'Shift Start Time is required' })
                .min(1, 'Shift Start Time is required')
                .refine((val) => val !== '00:00', { message: 'Shift Start Time is required' }),
            fomsT_IIHalfLogoutTime: z
                .string({ required_error: 'Shift End Time is required' })
                .min(1, 'Shift End Time is required')
                .refine((val) => val !== '00:00', { message: 'Shift End Time is required' }),
            fomsT_IHalfLogoutTime: z
                .string({ required_error: 'Lunch Start Time is required' })
                .min(1, 'Lunch Start Time is required')
                .refine((val) => val !== '00:00', { message: 'Lunch Start Time is required' }),
            fomsT_IIHalfLoginTime: z
                .string({ required_error: 'Lunch End Time is required' })
                .min(1, 'Lunch End Time is required')
                .refine((val) => val !== '00:00', { message: 'Lunch End Time is required' }),
            fomsT_FDWHrMin: z
                .string({ required_error: 'Total Working Hours is required' })
                .min(1, 'Total Working Hours is required')
                .refine((val) => val !== '00:00', { message: 'Total Working Hours is required' }),
            fomsT_HDWHrMin: z
                .string({ required_error: 'Half Day Working Hours is required' })
                .min(1, 'Half Day Working Hours is required')
                .refine((val) => val !== '00:00', { message: 'Half Day Working Hours is required' }),
            fomsT_LunchHoursDuration: z
                .string({ required_error: 'Lunch Hours is required' })
                .min(1, 'Lunch Hours is required')
                .refine((val) => val !== '00:00', { message: 'Lunch Hours is required' }),
            fomsT_DelayPerShiftHrMin: z
                .string({ required_error: 'Delay Per Shift is required' })
                .min(1, 'Delay Per Shift is required')
                .refine((val) => val !== '00:00', { message: 'Delay Per Shift is required' }),
            fomsT_EarlyPerShiftHrMin: z
                .string({ required_error: 'Early Per Shift is required' })
                .min(1, 'Early Per Shift is required')
                .refine((val) => val !== '00:00', { message: 'Early Per Shift is required' })
        }),
        update: z.object({
            fomsT_Id: z.number().optional(),
            fomS_Id: z.number().optional(),
            foms_ShiftName: z.string().min(1, 'Shift Name is required').max(100),
            fomsT_IHalfLoginTime: z
                .string({ required_error: 'Shift Start Time is required' })
                .min(1, 'Shift Start Time is required')
                .refine((val) => val !== '00:00', { message: 'Shift Start Time is required' }),
            fomsT_IIHalfLogoutTime: z
                .string({ required_error: 'Shift End Time is required' })
                .min(1, 'Shift End Time is required')
                .refine((val) => val !== '00:00', { message: 'Shift End Time is required' }),
            fomsT_IHalfLogoutTime: z
                .string({ required_error: 'Lunch Start Time is required' })
                .min(1, 'Lunch Start Time is required')
                .refine((val) => val !== '00:00', { message: 'Lunch Start Time is required' }),
            fomsT_IIHalfLoginTime: z
                .string({ required_error: 'Lunch End Time is required' })
                .min(1, 'Lunch End Time is required')
                .refine((val) => val !== '00:00', { message: 'Lunch End Time is required' }),
            fomsT_FDWHrMin: z
                .string({ required_error: 'Total Working Hours is required' })
                .min(1, 'Total Working Hours is required')
                .refine((val) => val !== '00:00', { message: 'Total Working Hours is required' }),
            fomsT_HDWHrMin: z
                .string({ required_error: 'Half Day Working Hours is required' })
                .min(1, 'Half Day Working Hours is required')
                .refine((val) => val !== '00:00', { message: 'Half Day Working Hours is required' }),
            fomsT_LunchHoursDuration: z
                .string({ required_error: 'Lunch Hours is required' })
                .min(1, 'Lunch Hours is required')
                .refine((val) => val !== '00:00', { message: 'Lunch Hours is required' }),
            fomsT_DelayPerShiftHrMin: z.string({ required_error: 'Delay Per Shift is required' }).min(1, 'Delay Per Shift is required'),
            fomsT_EarlyPerShiftHrMin: z.string({ required_error: 'Early Per Shift is required' }).min(1, 'Early Per Shift is required')
        }),
        delete: z.object({
            fomsT_Id: z.coerce.number().int({ message: 'fomsT_Id is required' }).min(1, { message: 'fomsT_Id must be greater than 0' })
        })
    },
    employeeShiftMapping: {
        add: z.object({
            foest_ShiftName: z.string({ required_error: 'Shift Name is required' }).min(1, 'Shift Name is required'),
            foest_Department: z.string({ required_error: 'Department is required' }).min(1, 'Department is required'),
            foest_Designation: z.string({ required_error: 'Designation is required' }).min(1, 'Designation is required'),
            foest_Employee: z.string({ required_error: 'Employee is required' }).min(1, 'Employee is required'),
            foest_HolidayType: z.string({ required_error: 'Day Type is required' }).min(1, 'Day Type is required'),
            foest_ApplicableDate: z.string({ required_error: 'Applicable Date is required' }).min(1, 'Applicable Date is required'),
            foest_GroupType: z.string({ required_error: 'Group Type is required' }).min(1, 'Group Type is required'),
            foest_TotalWork: z.string().optional(),
            foest_HalfDayWork: z
                .string({ required_error: 'Half Day Working Hours is required' })
                .min(1, 'Half Day Working Hours is required'),
            foest_MorningLogin: z.string({ required_error: 'Shift Start Time is required' }).min(1, 'Shift Start Time is required'),
            foest_MorningLogout: z.string({ required_error: 'Lunch Start Time is required' }).min(1, 'Lunch Start Time is required'),
            foest_AfternoonLogin: z.string({ required_error: 'Lunch End Time is required' }).min(1, 'Lunch End Time is required'),
            foest_AfternoonLogout: z.string({ required_error: 'Shift End Time is required' }).min(1, 'Shift End Time is required'),
            foest_DelayShift: z.string({ required_error: 'Delay Per Shift is required' }).min(1, 'Delay Per Shift is required'),
            foest_EarlyShift: z.string({ required_error: 'Early Per Shift is required' }).min(1, 'Early Per Shift is required'),
            foest_LunchHour: z.string({ required_error: 'Lunch Hours is required' }).min(1, 'Lunch Hours is required')
        }),
        update: z.object({
            foest_Id: z.number(),
            foest_ShiftName: z.string({ required_error: 'Shift Name is required' }).min(1, 'Shift Name is required'),
            foest_Department: z.string({ required_error: 'Department is required' }).min(1, 'Department is required'),
            foest_Designation: z.string({ required_error: 'Designation is required' }).min(1, 'Designation is required'),
            foest_Employee: z.string({ required_error: 'Employee is required' }).min(1, 'Employee is required'),
            foest_HolidayType: z.string({ required_error: 'Day Type is required' }).min(1, 'Day Type is required'),
            foest_ApplicableDate: z.string({ required_error: 'Applicable Date is required' }).min(1, 'Applicable Date is required'),
            foest_GroupType: z.string({ required_error: 'Group Type is required' }).min(1, 'Group Type is required'),
            foest_TotalWork: z.string().optional(),
            foest_HalfDayWork: z
                .string({ required_error: 'Half Day Working Hours is required' })
                .min(1, 'Half Day Working Hours is required'),
            foest_MorningLogin: z.string({ required_error: 'Shift Start Time is required' }).min(1, 'Shift Start Time is required'),
            foest_MorningLogout: z.string({ required_error: 'Lunch Start Time is required' }).min(1, 'Lunch Start Time is required'),
            foest_AfternoonLogin: z.string({ required_error: 'Lunch End Time is required' }).min(1, 'Lunch End Time is required'),
            foest_AfternoonLogout: z.string({ required_error: 'Shift End Time is required' }).min(1, 'Shift End Time is required'),
            foest_DelayShift: z.string({ required_error: 'Delay Per Shift is required' }).min(1, 'Delay Per Shift is required'),
            foest_EarlyShift: z.string({ required_error: 'Early Per Shift is required' }).min(1, 'Early Per Shift is required'),
            foest_LunchHour: z.string({ required_error: 'Lunch Hours is required' }).min(1, 'Lunch Hours is required')
        }),
        delete: z.object({
            foest_Id: z.coerce.number().int({ message: 'foest_Id is required' }).min(1, { message: 'foest_Id must be greater than 0' })
        })
    }
};
