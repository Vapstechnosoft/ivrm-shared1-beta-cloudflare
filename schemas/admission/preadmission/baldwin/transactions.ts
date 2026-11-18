import { z } from 'zod';
import {
    createAlphanumericSchemaPanCard,
    createEmailSchema,
    createOptionalAlphaNumericSchema,
    createOptionalNumberOnlyStringSchema,
    createOptionalStringSchema,
    createOptionalStringWithLettersSchema,
    createStringOnlyOptionalSchema,
    createStringOnlySchema,
    createStringSchema,
    deleteIdSchema
} from '../../../validationSchemas';

export const studentApplicationFormSchema = {
    // Reuse the same schema for add
    add: z.object({
        // Student Details
        pasR_FirstName: createStringOnlySchema('First Name', 1, 100),
        pasR_MiddleName: createStringOnlySchema('Middle Name', 1, 100),
        pasR_LastName: createStringOnlySchema('Last Name', 1, 100),

        // NATIONALITY - STRING
        pasR_Nationality: z.string().min(1, 'Student nationality is required'),
        pasR_FatherNationality: z.string().min(1, 'Father nationality is required'),
        PASR_FatherAadharNo: createOptionalNumberOnlyStringSchema('Father Aadhar No', 1, 12),
        PASR_FatherReligion: z.number().int({ message: 'Religion is required' }),
        PASR_FatherCaste: z.number().int({ message: 'Caste is required' }),
        fatherSubCaste_Id: createStringOnlyOptionalSchema('Sub Caste', 1, 100).optional(),

        PASR_FatherOfficePhNo: z.string().refine((val) => !val.startsWith('0'), {
            message: 'Mobile number cannot start with 0'
        }),
        PASR_FatherHomePhNo: z.string().refine((val) => !val.startsWith('0'), {
            message: 'Mobile number cannot start with 0'
        }),

        pasR_MotherNationality: z.string().min(1, 'Mother nationality is required'),

        pasR_MobileNo: z.string().refine((val) => !val.startsWith('0'), {
            message: 'Mobile number cannot start with 0'
        }),

        pasR_BirthPlace: createStringOnlyOptionalSchema('Student Birth Place', 1, 100),
        religion_Id: z.number().int({ message: 'Religion is required' }),
        caste_Id: z.number().int({ message: 'Caste is required' }),
        SubCaste_Id: z
            .union([z.string(), z.number()])
            .optional()
            .transform((val) => (val === '' ? undefined : val)),
        pasR_Sex: createStringSchema('Gender', 1, 50),
        pasR_DOB: z.date({ message: 'Date Of Birth is required' }).refine((date) => {
            // This will be validated in the form's custom validation
            return true;
        }),
        asmcL_Id: z
            .number()
            .int({ message: 'Applying For is required' })
            .refine((val) => val > 0, { message: 'Please select a valid class' }),
        pasR_emailId: createEmailSchema('Student Email', 1, 50),
        pasR_MotherTongue: createStringOnlyOptionalSchema('Student Mother Tongue', 1, 100),
        PASR_Churchname: createOptionalAlphaNumericSchema('Church Name', 1, 100),
        PASR_ChurchAddress: createOptionalAlphaNumericSchema('Church Address', 1, 100),

        // Other Details
        pasR_AadharNo: z
            .string()
            .refine((val) => val === '' || val.length === 12, {
                message: 'Aadhar No must be exactly 12 digits'
            })
            .optional(),
        pasR_Languagespeaking: createStringOnlyOptionalSchema('Student Language Speaking At Home', 1, 100),
        pasR_LastPlayGrndAttnd: createStringOnlyOptionalSchema('Student Last Play Ground Attended', 1, 50),
        pasR_ExtraActivity: createStringOnlyOptionalSchema('Student Extra Activity', 1, 50),
        source_ids: z.array(z.string()).optional(),
        reference_ids: z.array(z.string()).optional(),
        pasR_TransportReqdFlag: z.number().int({ message: 'Transport Required Flag is required' }),

        PASR_BloodGroup: z
            .union([z.string(), z.number(), z.nan()])
            .optional()
            .transform((val) => (val === '' || Number.isNaN(val) ? undefined : String(val))),
        // Residential Address
        pasR_ConStreet: createOptionalAlphaNumericSchema('Street', 1, 100),
        pasR_ConArea: createOptionalAlphaNumericSchema('Area', 1, 100),
        pasR_ConCountry: z.string().optional(),
        pasR_ConState: z.number().int().optional(),
        pasR_ConCity: createOptionalAlphaNumericSchema('City', 1, 100),
        pasR_ConPincode: z
            .union([z.string(), z.number()])
            .optional()
            .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

        // Permanent Address
        pasR_PerStreet: createOptionalAlphaNumericSchema('Street', 1, 100),
        pasR_PerArea: createOptionalAlphaNumericSchema('Area', 1, 100),
        pasR_PerCountry: z.string().optional(),
        pasR_PerState: z.number().int().optional(),
        pasR_PerCity: createOptionalAlphaNumericSchema('City', 1, 100),
        pasR_PerPincode: z
            .union([z.string(), z.number()])
            .optional()
            .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

        // Father Details
        pasR_FatherName: createStringOnlySchema('Father Name', 1, 100),
        pasR_FatherSurname: createStringOnlyOptionalSchema('Father Surname', 1, 100),
        pasR_FatherEducation: createStringOnlyOptionalSchema('Father Education', 1, 100),
        pasR_FatherOccupation: createOptionalStringSchema('Father Occupation', 1, 100),
        pasR_FatherPanno: createAlphanumericSchemaPanCard('Father PAN Number', true),
        pasR_FatherDesignation: createStringOnlyOptionalSchema('Father Designation', 1, 100),
        pasR_FatherOfficeAddr: createOptionalStringSchema('Father Office Address', 1, 100),
        pasR_FatherMobleNo: z
            .string()
            .refine((val) => !val.startsWith('0'), {
                message: 'Mobile number cannot start with 0'
            })
            .optional(),

        PASR_FatheremailId: createEmailSchema('Father Email', 1, 50),
        pasA_FatherInstitution: createOptionalStringSchema('Father Attended Institution', 1, 150),
        pasA_FatherMotherTongue: createStringOnlyOptionalSchema('Father Mother Tongue', 1, 100),
        pasA_FatherBusiness: createOptionalStringSchema('Father Business', 1, 150),
        pasA_FatherCompany: createOptionalStringSchema('Father Company', 1, 150),

        // Mother Details
        pasR_MotherName: createStringOnlySchema('Mother Name', 1, 100),
        pasR_MotherSurname: createStringOnlyOptionalSchema('Mother Surname', 1, 100),
        pasR_MotherEducation: createStringOnlyOptionalSchema('Mother Education', 1, 100),
        pasR_MotherOccupation: createOptionalStringSchema('Mother Occupation', 1, 100),
        PASR_MotherAadharNo: createOptionalNumberOnlyStringSchema('Father Aadhar No', 1, 12),
        PASR_MotherReligion: z.number().int({ message: 'Religion is required' }),
        PASR_MotherCaste: z.number().int({ message: 'Caste is required' }),
        motherSubCaste_Id: createStringOnlyOptionalSchema('Sub Caste', 1, 100).optional(),

        pasR_MotherPanno: createAlphanumericSchemaPanCard('Mother PAN Number', true),
        pasR_MotherDesignation: createStringOnlyOptionalSchema('Mother Designation', 1, 100),
        PASR_MotherOfficePhNo: createOptionalNumberOnlyStringSchema('Mother Office Phone No', 1, 15),
        PASR_MotherHomePhNo: createOptionalNumberOnlyStringSchema('Mother Home Phone No', 1, 15),
        PASR_MotheremailId: createEmailSchema('Mother Email', 1, 50),
        pasR_MotherOfficeAddr: createOptionalStringSchema('Mother Office Address', 1, 100),
        pasR_MotherMobleNo: z
            .string()
            .refine((val) => !val.startsWith('0'), {
                message: 'Mobile number cannot start with 0'
            })
            .optional(),
        pasA_MotherInstitution: createOptionalStringSchema('Mother Attended Institution', 1, 150),
        pasA_MotherMotherTongue: createStringOnlyOptionalSchema('Mother`s Mother Tongue', 1, 100),
        pasA_MotherBusiness: createOptionalStringSchema('Mother Business', 1, 150),
        pasA_MotherCompany: createOptionalStringSchema('Mother Company', 1, 150),
        // Siblings Details (array, like add schema)
        siblingsDetails: z
            .array(
                z.object({
                    pasR_Id: z.number().int().optional(),
                    pasrS_SchoolName: createOptionalAlphaNumericSchema('School Name', 1, 150).optional(),
                    pasrS_Age: z.number().int().optional(),
                    pasrS_Gender: createStringOnlyOptionalSchema('Gender', 1, 50),
                    pasrS_Institution: createOptionalAlphaNumericSchema('Institution', 1, 150).optional(),
                    pasrS_DOB: z.string().optional(),
                    verrejstatus: z.string().optional(),
                    pasrS_Id: z.number().int().optional(),
                    pasrS_SiblingsName: createStringOnlyOptionalSchema('Sibling Name', 1, 100),
                    pasrS_SiblingsClass: createOptionalAlphaNumericSchema('Sibling Class', 1, 100),
                    pasrS_SiblingsAdmissionNo: createOptionalNumberOnlyStringSchema('Sibling Admission No', 1, 50),
                    pasrS_SiblingsSection: createStringOnlyOptionalSchema('Sibling Section', 1, 50)
                })
            )
            .optional(),

        // Previous School Details (array, like siblingsDetails)
        previousSchoolDetails: z
            .array(
                z.object({
                    pasrpS_PrvSchoolName: createOptionalAlphaNumericSchema('Previous School Name', 1, 150),
                    pasrpS_PreviousClass: createOptionalNumberOnlyStringSchema('Previous Class', 1, 100),
                    pasrpS_Board: createStringOnlyOptionalSchema('Board', 1, 100),
                    pasrpS_LeftYear: createOptionalNumberOnlyStringSchema('Left Year', 1, 10),
                    pasrpS_LeftReason: createStringOnlyOptionalSchema('Reason for Leaving', 1, 150),
                    pasrpS_Address: createOptionalStringWithLettersSchema('School Address', 1, 200)
                })
            )
            .optional(),

        guardianDetails: z
            .array(
                z.object({
                    PASRG_GuardianName: createStringOnlyOptionalSchema('Guardian Name', 1, 100),
                    PASRG_GuardianRelation: createStringOnlyOptionalSchema('Guardian Relation', 1, 100),
                    ReportType: createStringOnlyOptionalSchema('Report Type', 1, 100),
                    PASRG_PhoneOffice: createOptionalNumberOnlyStringSchema('Office Phone', 1, 15),
                    PASRG_GuardianPhoneNo: createOptionalNumberOnlyStringSchema('Guardian Phone', 1, 15)
                })
            )
            .optional(),

        // Income
        pasR_FatherIncome: z.number().default(0).optional(),
        pasR_MotherIncome: z.number().default(0).optional(),

        // Alternate Contact
        pasR_AltContactNo: z
            .string()

            .refine((val) => val === '' || !val.startsWith('0'), {
                message: 'Mobile number cannot start with 0'
            })
            .optional(),
        pasR_AltContactEmail: createEmailSchema('Alternate Contact Email', 1, 50, true),
        PASR_FatherPassingYear: createOptionalNumberOnlyStringSchema('Father Passing Year', 1, 4),
        PASR_MotherPassingYear: createOptionalNumberOnlyStringSchema('Mother Passing Year', 1, 4),

        // Previous School Details

        //Other Details
        pasA_AdmittingReason: createOptionalStringSchema('Admitting Reason', 1, 250),
        pasA_WillingToContributeRemarks: createOptionalStringSchema('Willing to Contribute Remarks', 1, 250),
        pasA_WillingToContributeFlg: z.number().int({ message: 'Willing to Contribute Flag' }),

        // Final
        pasR_UndertakingFlag: z.number().int({ message: 'Undertaking Flag is required' })
    }),
    delete: z.object({
        pasr_id: deleteIdSchema('pasr_id')
    })
};
