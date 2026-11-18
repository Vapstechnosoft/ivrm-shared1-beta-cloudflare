import { z } from 'zod';

const mobilePattern = /^[7-9]\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ndaStudentProfileUpdateSchema = z.object({
    ASTUREQ_Id: z.number().default(0),
    AMSTG_Id: z.number().default(0),
    AMST_ID: z.number().default(0),

    // Student Details
    Mobilenumber: z
        .string()
        .min(1, 'Enter Mobile number')
        .min(10, 'Mobile number must contain 10 digits')
        .max(10, 'Mobile number must contain 10 digits')
        .regex(mobilePattern, 'Enter valid Mobile NO'),
    EmailidforCandidate: z.string().min(1, 'Enter Email').regex(emailPattern, 'Enter valid Email'),
    Bloodgroup: z.string().optional().or(z.literal('')),

    // Guardian Details
    Guardianname: z.string().min(1, 'Enter Guardianname').optional().or(z.literal('')),
    AMSTG_GuardianPhoneNo: z
        .string()
        .min(1, 'Enter Mobile number')
        .min(10, 'Mobile number must contain 10 digits')
        .max(10, 'Mobile number must contain 10 digits')
        .regex(mobilePattern, 'Enter valid Mobile NO')
        .optional()
        .or(z.literal('')),
    AMSTG_emailid: z.string().min(1, 'Enter Email').regex(emailPattern, 'Enter valid Email').optional().or(z.literal('')),

    // Father Details
    AMST_FatherMobleNo: z
        .string()
        .min(1, 'Enter Mobile number')
        .min(10, 'Mobile number must contain 10 digits')
        .max(10, 'Mobile number must contain 10 digits')
        .regex(mobilePattern, 'Enter valid Mobile NO'),
    AMST_FatheremailId: z.string().min(1, 'Enter Email').regex(emailPattern, 'Enter valid Email'),

    // Mother Details
    AMST_MotherMobileNo: z
        .string()
        .min(1, 'Enter Mobile number')
        .min(10, 'Mobile number must contain 10 digits')
        .max(10, 'Mobile number must contain 10 digits')
        .regex(mobilePattern, 'Enter valid Mobile NO'),
    AMST_MotherEmailId: z.string().min(1, 'Enter Email').regex(emailPattern, 'Enter valid Email'),

    // Photo URLs
    ASTUREQ_StudentPhoto: z.string().optional().or(z.literal('')),
    ASTUREQ_FatherPhoto: z.string().optional().or(z.literal('')),
    ASTUREQ_MotherPhoto: z.string().optional().or(z.literal('')),
    ASTUREQ_GuardianPhoto: z.string().optional().or(z.literal('')),

    // Residential Address
    Resstreet: z.string().min(1, 'Enter Street').or(z.literal('')),
    ResArea: z.string().min(1, 'Enter Area').or(z.literal('')),
    Rescity: z.string().min(1, 'Enter City').or(z.literal('')),
    Rescountry: z
        .union([z.number(), z.string()])
        .refine((val) => val !== '0' && val !== 0, 'Select Country')
        .or(z.literal('')),
    Resstate: z
        .union([z.number(), z.string()])
        .refine((val) => val !== '0' && val !== 0, 'Select State')
        .or(z.literal('')),
    ResPincode: z.string().min(1, 'Enter Pincode').or(z.literal('')),

    // Permanent Address
    Perstreett: z.string().min(1, 'Enter Street').or(z.literal('')),
    PerArea: z.string().min(1, 'Enter Area').or(z.literal('')),
    Percity: z.string().min(1, 'Enter City').or(z.literal('')),
    Percountry: z
        .union([z.number(), z.string()])
        .refine((val) => val !== '0' && val !== 0, 'Select Country')
        .or(z.literal('')),
    PerState: z
        .union([z.number(), z.string()])
        .refine((val) => val !== '0' && val !== 0, 'Select State')
        .or(z.literal('')),
    PerPincode: z.string().min(1, 'Enter Pincode').or(z.literal('')),

    // Additional mapping fields
    flagSMF: z.string().optional(),
    ASTUREQ_Date: z.string().optional()
});

export type NdaStudentProfileUpdateFields = z.infer<typeof ndaStudentProfileUpdateSchema>;
