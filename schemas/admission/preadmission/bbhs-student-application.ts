import { z } from 'zod';
import {
    createAlphanumericSchemaPanCard,
    createEmailSchema,
    createOptionalAlphaNumericSchema,
    createOptionalNumberOnlyStringSchema,
    createOptionalStringSchema,
    createStringOnlyOptionalSchema,
    createStringOnlySchema,
    createStringSchema
} from '../../validationSchemas';

export const bbhsStudentApplicationFormSchema = {
    add: z.object({
        // Student Details
        pasR_FirstName: createStringOnlySchema('First Name', 1, 100),
        pasR_MiddleName: createStringOnlyOptionalSchema('Middle Name', 1, 100),
        pasR_LastName: createStringOnlySchema('Last Name', 1, 100),
        pasR_RegistrationNo: z.string().optional(),
        pasR_DOB: z.date({ message: 'Date Of Birth is required' }),
        pasR_Sex: createStringSchema('Gender', 1, 20),
        pasR_Nationality: z.string().min(1, 'Student nationality is required'),
        religion_Id: z.number().int({ message: 'Religion is required' }),
        caste_Id: z.number().int({ message: 'Caste is required' }),
        pasR_Caste: createStringOnlyOptionalSchema('Sub-Caste', 1, 50),
        asmcL_Id: z.number().int({ message: 'Applying For is required' }).min(1, 'Please select a valid class'),
        pasR_BirthPlace: createStringOnlyOptionalSchema('Student Birth Place', 1, 100),
        pasR_MotherTongue: createStringOnlyOptionalSchema('Student Mother Tongue', 1, 100),
        pasR_MobileNo: z.string().min(10, 'Mobile number must be at least 10 digits'),
        pasR_emailId: createEmailSchema('Student Email', 1, 100),
        pasR_AadharNo: z
            .string()
            .optional()
            .refine((val) => !val || val.length === 12, {
                message: 'Aadhar No must be exactly 12 digits'
            }),
        pasR_Churchname: createOptionalStringSchema('Church Name', 1, 150),
        pasR_BloodGroup: createOptionalStringSchema('Blood Group', 1, 10),

        // Address Details - Residential
        pasR_ConStreet: createOptionalAlphaNumericSchema('Street', 1, 200),
        pasR_ConArea: createOptionalAlphaNumericSchema('Area', 1, 100),
        pasR_ConCountry: z.string().min(1, 'Country is required'),
        pasR_ConState: z.number().int().optional(),
        pasR_ConCity: createOptionalAlphaNumericSchema('City', 1, 100),
        pasR_ConPincode: z
            .union([z.string(), z.number()])
            .optional()
            .transform((v) => v?.toString()),

        // Address Details - Permanent
        pasR_PerStreet: createOptionalAlphaNumericSchema('Street', 1, 200),
        pasR_PerArea: createOptionalAlphaNumericSchema('Area', 1, 100),
        pasR_PerCountry: z.string().optional(),
        pasR_PerState: z.number().int().optional(),
        pasR_PerCity: createOptionalAlphaNumericSchema('City', 1, 100),
        pasR_PerPincode: z
            .union([z.string(), z.number()])
            .optional()
            .transform((v) => v?.toString()),

        // Father Details
        pasR_FatherName: createStringOnlySchema('Father Name', 1, 100),
        pasR_FatherEducation: createStringOnlyOptionalSchema('Father Education', 1, 100),
        pasR_FatherOccupation: createOptionalStringSchema('Father Occupation', 1, 100),
        pasR_FatherDesignation: createStringOnlyOptionalSchema('Father Designation', 1, 100),
        pasR_FatherOfficeAddr: createOptionalStringSchema('Father Office Address', 1, 500),
        pasR_FatherMobleNo: z.string().min(10).optional().or(z.literal('')),
        pasR_FatherPanno: createAlphanumericSchemaPanCard('Father PAN Number', true),
        pasR_FatherIncome: z.coerce.number().optional(),
        pasR_FatherNationality: z.string().optional(),
        pasR_FatherPassingYear: createOptionalNumberOnlyStringSchema('Passing Year', 1, 4),

        // Mother Details
        pasR_MotherName: createStringOnlySchema('Mother Name', 1, 100),
        pasR_MotherEducation: createStringOnlyOptionalSchema('Mother Education', 1, 100),
        pasR_MotherOccupation: createOptionalStringSchema('Mother Occupation', 1, 100),
        pasR_MotherDesignation: createStringOnlyOptionalSchema('Mother Designation', 1, 100),
        pasR_MotherOfficeAddr: createOptionalStringSchema('Mother Office Address', 1, 500),
        pasR_MotherMobleNo: z.string().min(10).optional().or(z.literal('')),
        pasR_MotherPanno: createAlphanumericSchemaPanCard('Mother PAN Number', true),
        pasR_MotherIncome: z.coerce.number().optional(),
        pasR_MotherNationality: z.string().optional(),
        pasR_MotherPassingYear: createOptionalNumberOnlyStringSchema('Passing Year', 1, 4),

        // Other Details
        pasR_Languagespeaking: createStringOnlyOptionalSchema('Languages Spoken', 1, 100),
        pasR_ExtraActivity: createStringOnlyOptionalSchema('Extra Activities', 1, 200),
        pasR_LastPlayGrndAttnd: createStringOnlyOptionalSchema('Last School Attended', 1, 200),
        pasR_UndertakingFlag: z.boolean().default(false),

        // Dynamic Fields
        siblingsDetails: z
            .array(
                z.object({
                    pasrS_SiblingsName: createStringOnlyOptionalSchema('Sibling Name', 1, 100),
                    pasrS_SiblingsClass: createOptionalAlphaNumericSchema('Class', 1, 50),
                    pasrS_SiblingsAdmissionNo: createOptionalStringSchema('Adm No', 1, 50),
                    pasrS_SchoolName: createOptionalStringSchema('School Name', 1, 150),
                    pasrS_Institution: createOptionalStringSchema('Institution', 1, 100),
                    pasrS_Age: z.coerce.number().optional(),
                    pasrS_DOB: z.date().optional()
                })
            )
            .optional()
            .default([]),

        previousSchoolDetails: z
            .array(
                z.object({
                    pasrpS_PrvSchoolName: createOptionalStringSchema('School Name', 1, 200),
                    pasrpS_PreviousClass: createOptionalStringSchema('Class', 1, 50),
                    pasrpS_Board: createOptionalStringSchema('Board', 1, 100),
                    pasrpS_LeftYear: createOptionalNumberOnlyStringSchema('Year', 1, 4),
                    pasrpS_LeftReason: createOptionalStringSchema('Reason', 1, 200),
                    pasrpS_Address: createOptionalStringSchema('Address', 1, 500)
                })
            )
            .optional()
            .default([])
    })
};
