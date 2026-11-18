import { z } from 'zod';
import {
    createAllAllowedOptional,
    createAllAllowedRequired,
    createAlphanumericSchema,
    createEmailSchema,
    createNumberOnlyStringSchema,
    createOptionalAlphaNumericAllowBothSchema,
    createOptionalAlphaNumericSchema,
    createOptionalNumberOnlyPrecentageSchema,
    createOptionalNumberOnlyStringSchema,
    createOptionalStringSchema,
    createOptionalStringWithLettersSchema,
    createStringOnlyOptionalSchema,
    createStringOnlySchema,
    deleteIdSchema
} from '../validationSchemas';

// Other Information schema (nested object for admission form)
const OtherInformationSchema = z.object({
    religion: createOptionalStringWithLettersSchema('Religion', 2, 50).optional(),
    motherTongue: createOptionalStringWithLettersSchema('Mother Tongue', 2, 50).optional(),
    nationality: createOptionalStringWithLettersSchema('Nationality', 2, 50).optional(),
    socialCategory: z.enum(['General', 'OBC', 'SC', 'ST', 'Other']).or(z.literal('')).optional(),
    isMinority: z.boolean().optional(),
    identificationMark: createOptionalStringSchema('Identification Mark', 0, 100).optional(),
    additionalInfo: createOptionalStringSchema('Additional Info', 0, 500).optional()
});

// Health & Medical Details schema (nested object for admission form)
const HealthMedicalDetailsSchema = z
    .object({
        bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).or(z.literal('')).optional(),
        heightCm: createOptionalNumberOnlyStringSchema('Height (cm)', 1, 3).optional(),
        weightKg: createOptionalNumberOnlyStringSchema('Weight (kg)', 1, 3).optional(),
        isAllergic: z.boolean().optional(),
        allergies: createOptionalStringSchema('Allergies', 0, 255).optional(),
        chronicIllness: createOptionalStringSchema('Chronic Illness', 0, 255).optional(),
        immunization: createOptionalStringSchema('Immunization', 0, 255).optional(),
        disability: z.enum(['None', 'Visual', 'Hearing', 'Physical', 'Mental', 'Other']).or(z.literal('')).optional(),
        disabilityDetails: createOptionalStringSchema('Disability Details', 0, 500).optional()
    })
    .refine(
        (data) => {
            if (data.isAllergic) {
                return !!data.allergies && data.allergies !== '';
            }
            return true;
        },
        {
            message: 'Allergies must be provided when "isAllergic" is true',
            path: ['allergies']
        }
    );

export const studentAdmissionFormSchema = {
    // Reuse the same schema for add
    add: z.object({
        // Student Details
        asmaY_Id: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ required_error: 'Academic Year is required', invalid_type_error: 'Select Year' }).min(1, 'Academic Year is required')
        ),
        amsT_FirstName: createStringOnlySchema('First Name', 1, 100),
        amsT_MiddleName: createStringOnlyOptionalSchema('Middle Name', 0, 100).optional(),
        amsT_LastName: createStringOnlyOptionalSchema('Last Name', 0, 100).optional(),
        amsT_RegistrationNo: createAllAllowedRequired('Registration Number', 1, 50),
        asmcL_Id: z.number({ required_error: 'Class is required' }).min(1, 'Class is required'),
        amsT_AdmissionNo: createAllAllowedRequired('Admission No', 1, 50),
        caste_Id: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select Caste' }).int().optional()
        ),
        pasR_Student_Pic_Path: createOptionalStringSchema('Student Photo Path', 1, 500).optional(),
        pasR_Section_Id: z.number().int().optional(),
        amsT_DOB_Words: createStringOnlyOptionalSchema('Date Of Birth In Words', 1, 1000).optional(),
        pasR_Age: z.number().int().optional(),
        imC_Id: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ required_error: 'Caste is required', invalid_type_error: 'Select Caste' }).min(1, 'Caste is required')
        ),
        amsT_SubCasteIMC_Id: createStringOnlyOptionalSchema('Sub Caste', 1, 100).optional(),

        amsT_BirthCertNO: createOptionalAlphaNumericSchema('Birth Certificate Number', 1, 50),
        amsT_CasteCertiNo: createOptionalAlphaNumericSchema('Caste Certificate Number', 1, 50),
        amsT_BiometricId: createOptionalAlphaNumericSchema('Biometric Id', 1, 50),
        amsT_RFCardNo: createOptionalAlphaNumericSchema('RF Card Number', 1, 50),
        amsT_BloodGroup: createOptionalStringSchema('Blood Group', 1, 50),
        studentCategoryId: z.number().int().optional(),
        asmcC_Id: z.coerce.number().int().optional(),
        amsT_DOB: z.preprocess(
            (val) => (val === '' || val === null ? undefined : val),
            z.coerce.date({
                errorMap: (issue, ctx) => {
                    if (issue.code === 'invalid_date' || issue.code === 'invalid_type') {
                        return { message: 'Select Date of Birth' };
                    }
                    return { message: ctx.defaultError };
                }
            })
        ),

        //ecs flag
        amsT_ECSFlag: z.number().int().optional(),

        asecS_AccountNo: createOptionalNumberOnlyStringSchema('Bank Account Number', 1, 50).optional().nullable(),
        asecS_BankName: createOptionalStringSchema('Bank Name', 1, 100).optional().nullable(),
        asecS_AccountHolderName: createOptionalStringSchema('Account Holder Name', 1, 100).optional().nullable(),
        asecS_AccountType: createOptionalStringSchema('Account Type', 1, 50).optional().nullable(),
        asecS_MICRNo: createOptionalNumberOnlyStringSchema('MICR Code', 1, 20).optional().nullable(),

        //normal bank details
        amsT_BankAccountNo: createOptionalNumberOnlyStringSchema('Bank Account Number', 1, 50).optional().nullable(),
        amsT_BankName: createOptionalStringSchema('Bank Name', 1, 100).optional().nullable(),
        amsT_BankIFSCCode: createOptionalAlphaNumericAllowBothSchema('IFSC Code', 1, 20).optional().nullable(),
        amsT_BankBranch: createOptionalStringSchema('Branch Name', 1, 100).optional().nullable(),

        asecS_Branch: createOptionalStringSchema('Branch Name', 1, 100).optional().nullable(),
        amsT_MediumOfInstruction: createStringOnlyOptionalSchema('Medium Of Instruction', 1, 50).optional(),

        // EMIS flag

        isEmisBpl: z.number().int().optional(),
        amsT_BPLCardNo: createOptionalAlphaNumericSchema('EMIS Card No', 1, 50).optional(),

        amsT_Tpin: createOptionalAlphaNumericSchema('Student TPIN', 1, 50),
        amsT_GPSTrackingId: createAllAllowedOptional('GPS Tracing Id', 1, 50),
        amsT_MOInstruction: createStringOnlyOptionalSchema('Medium Of Instruction', 1, 50),

        // NATIONALITY - STRING
        amsT_FatherNationality: z.number().int().optional(),

        amsT_MobileNo: z
            .string({ required_error: 'Mobile Number is required' })
            .min(1, 'Mobile Number is required')
            .refine(
                (val) => {
                    if (!val) return false;
                    // Strip country code (e.g. "+91 ") and spaces/dashes, keep only digits after dial code
                    const digitsOnly = val.replace(/\D/g, '');
                    // For India (+91) the national number is the last 10 digits
                    // For other countries the number stored as "+(dialCode) (nationalNumber)"
                    // We validate by checking national number part length is exactly 10
                    const spaceIdx = val.indexOf(' ');
                    const nationalPart = spaceIdx !== -1 ? val.slice(spaceIdx + 1).replace(/\D/g, '') : digitsOnly;
                    return nationalPart.length === 10;
                },
                { message: 'Mobile number must be exactly 10 digits' }
            ),

        amsT_BirthPlace: createStringOnlyOptionalSchema('Student Birth Place', 1, 100),
        asmS_Id: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ required_error: 'Section is required', invalid_type_error: 'Select Section' }).min(1, 'Section is required')
        ),
        religion_Id: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select Religion' }).int().optional()
        ),
        amsT_StudentCategory_Id: z.coerce.number().int().optional(),

        amsT_ReligionId: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ required_error: 'Religion is required', invalid_type_error: 'Select Religion' }).min(1, 'Religion is required')
        ),
        amsT_Date: z.preprocess(
            (val) => (val === '' || val === null ? undefined : val),
            z.coerce.date({
                errorMap: (issue, ctx) => {
                    if (issue.code === 'invalid_date' || issue.code === 'invalid_type') {
                        return { message: 'Select Date of Admission' };
                    }
                    return { message: ctx.defaultError };
                }
            })
        ),
        amsT_Sex: z.string({ required_error: 'Gender is required' }).min(1, 'Gender is required'),
        amsT_Nationality: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ required_error: 'Country is required', invalid_type_error: 'Select Country' }).min(1, 'Country is required')
        ),
        amsT_State: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select State' }).int().optional()
        ),

        pasR_DOB: z.coerce.date().optional(),

        feeConcessionType: z.coerce.number({ required_error: 'Fee Concession Type is required' }).min(1, 'Fee Concession Type is required'),
        // Student email (required)
        amsT_emailId: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
        // Support multiple student emails (array). Each item may be empty or a valid email.
        adm_M_Student_EmailIdDTO: z
            .array(
                z.object({
                    amsT_emailId: z.string().email().optional().nullable().or(z.literal(''))
                })
            )
            .optional(),

        // Support multiple student mobile numbers stored by the UI
        mobileNos: z
            .array(
                z.object({
                    amsT_MobileNo: z.string().optional().nullable(),
                    amstsmS_CountryCode: z.string().optional().nullable()
                })
            )
            .optional(),
        amsT_MotherTongue: z.string().optional().nullable(),

        // Other Details
        amsT_AadharNo: z
            .string()
            .optional()
            .nullable()
            .refine((val) => !val || /^\d{12}$/.test(val), { message: 'Aadhar number must be exactly 12 digits' }),
        amsT_ApparNo: z.string().refine((val) => !val || /^\d{12}$/.test(val), { message: 'APAAR ID must be exactly 12 digits' }).optional().nullable(),
        amsT_APAARId: z.preprocess((val) => (val === '' || val === null || val === undefined ? 0 : Number(val)), z.number().optional().nullable()),
        amsT_LanguageSpoken: z.string().optional().nullable(),

        reference_ids: z.array(z.string()).optional(),

        // Other Information (nested object)
        otherInformation: OtherInformationSchema.optional(),

        // Health & Medical Details (nested object)
        healthMedicalDetails: HealthMedicalDetailsSchema.optional(),

        // Residential Address
        amsT_ConStreet: z.string().optional().nullable(),
        amsT_ConArea: z.string().optional().nullable(),
        amsT_ConCountry: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select Country' }).int().optional().nullable()
        ),
        amsT_ConState: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select State' }).int().optional()
        ),
        amsT_ConDistrict: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select District' }).int().optional()
        ),
        amsT_ConCity: z.string().optional().nullable(),
        amsT_ConPincode: z
            .union([z.string(), z.number()])
            .optional()
            .nullable()
            .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

        // Permanent Address
        amsT_PerStreet: z.string().optional().nullable(),
        amsT_PerArea: z.string().optional().nullable(),
        amsT_PerCountry: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select Country' }).int().optional().nullable()
        ),
        amsT_PerState: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select State' }).int().optional()
        ),
        amsT_PerDistrict: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select District' }).int().optional()
        ),
        amsT_PerCity: z.string().optional().nullable(),
        amsT_PerPincode: z
            .union([z.string(), z.number()])
            .optional()
            .nullable()
            .transform((val) => (val === undefined || val === null || val === '' ? undefined : String(val))),

        //step=3

        // Father Details
        fatherAliveFlag: z.boolean().optional(),
        fatherName: z.string().optional().nullable(),
        fatherSurname: z.string().optional().nullable(),
        fatherAadharNo: z
            .string()
            .optional()
            .nullable()
            .refine((val) => !val || /^\d{12}$/.test(val), { message: 'Aadhar number must be exactly 12 digits' }),

        FatherEducation: z.string().optional().nullable(),
        fatherPAN: z.string().optional().nullable(),
        fatherDesignation: z.string().optional().nullable(),
        fatherMobileNumbers: z.preprocess((val: any) => {
            if (typeof val === 'string' && val.trim() !== '') return [{ mobileNo: val.trim() }];
            if (Array.isArray(val)) return val;
            return [];
        }, z.array(z.object({ mobileNo: z.string().optional().nullable() })).optional()),
        fatherMaritalStatus: z.string().optional().nullable(),

        fatherEmailIds: z.preprocess((val: any) => {
            if (typeof val === 'string' && val.trim() !== '') return [{ emailId: val.trim() }];
            if (Array.isArray(val)) return val;
            return [];
        }, z.array(z.object({ emailId: z.string().email().optional().nullable().or(z.literal('')) })).optional()),
        fatherHomePhone: z.string().optional().nullable(),

        fatherNationality: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional()),

        fatherPresentAddress: z
            .object({
                address: z.string().optional().nullable().or(z.literal('')),
                state: z.number().optional().nullable(),
                city: z.string().optional().nullable().or(z.literal('')),
                pincode: z
                    .union([z.string(), z.number()])
                    .optional()
                    .nullable()
                    .transform((val) => (val ? String(val) : '')),
                po: z.string().optional().nullable().or(z.literal('')),
                country: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional()),
                ps: z.string().optional().nullable().or(z.literal(''))
            })
            .optional()
            .nullable(),

        fatherPermanentAddress: z
            .object({
                address: z.string().optional().nullable().or(z.literal('')),
                state: z.number().optional().nullable(),
                city: z.string().optional().nullable().or(z.literal('')),
                pincode: z
                    .union([z.string(), z.number()])
                    .optional()
                    .nullable()
                    .transform((val) => (val ? String(val) : '')),
                po: z.string().optional().nullable().or(z.literal('')),
                ps: z.string().optional().nullable().or(z.literal('')),
                country: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional())
            })
            .optional()
            .nullable(),
        fatherOfficeAddress: z.string().optional().nullable(),

        fatherCasteCertificateNo: z.string().optional().nullable(),
        fatherOccupation: z.string().optional().nullable(),
        amsT_FatherPassingYear: z.preprocess(
            (val) => (val === undefined || val === null || val === '' ? undefined : Number(val)),
            z.number().int({ message: 'Father Passing Year must be a valid year' }).optional()
        ),
        fatherAnnualIncome: z.number().optional().nullable(),
        fatherReligionId: z.number().int().optional().nullable(),
        fatherCasteId: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select Caste' }).int().optional().nullable()
        ),
        fatherSubCaste: z.string().optional().nullable(),
        fatherTribe: z.string().optional().nullable(),
        fatherChurchAffiliation: z.string().optional().nullable(),
        fatherBankName: z.string().optional().nullable(),
        fatherBankAccountNo: z.string().optional().nullable(),
        fatherBankIFSCCode: z.string().optional().nullable(),
        fatherBankBranch: z.string().optional().nullable(),
        fatherOfficePhone: z.string().optional().nullable(),

        // Mother Details
        motherAliveFlag: z.boolean().optional(),
        MotherAliveFlag: z.boolean().optional(),
        motherName: z.string().optional().nullable(),
        motherSurname: z.string().optional().nullable(),
        motherAadharNo: z
            .string()
            .optional()
            .nullable()
            .refine((val) => !val || /^\d{12}$/.test(val), { message: 'Aadhar number must be exactly 12 digits' }),
        motherMaritalStatus: z.string().optional().nullable(),

        motherMobileNumbers: z.preprocess((val: any) => {
            if (typeof val === 'string' && val.trim() !== '') return [{ mobileNo: val.trim() }];
            if (Array.isArray(val)) return val;
            return [];
        }, z.array(z.object({ mobileNo: z.string().optional().nullable() })).optional()),
        motherEmailIds: z.preprocess((val: any) => {
            if (typeof val === 'string' && val.trim() !== '') return [{ emailId: val.trim() }];
            if (Array.isArray(val)) return val;
            return [];
        }, z.array(z.object({ emailId: z.string().email().optional().nullable().or(z.literal('')) })).optional()),
        motherHomePhone: z.string().optional().nullable(),
        motherNationality: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional()),

        motherQualification: z.string().optional().nullable(),
        motherPassingYear: z.preprocess(
            (val) => (val === undefined || val === null || val === '' ? undefined : Number(val)),
            z.number().int({ message: 'Mother Passing Year must be a valid year' }).optional()
        ),
        motherPresentAddress: z
            .object({
                address: z.string().optional().nullable().or(z.literal('')),
                country: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional()),
                city: z.string().optional().nullable().or(z.literal('')),
                state: z.number().optional().nullable(),
                po: z.string().optional().nullable().or(z.literal('')),
                pincode: z
                    .union([z.string(), z.number()])
                    .optional()
                    .nullable()
                    .transform((val) => (val ? String(val) : '')),
                ps: z.string().optional().nullable().or(z.literal(''))
            })
            .optional()
            .nullable(),

        motherPermanentAddress: z
            .object({
                address: z.string().optional().nullable().or(z.literal('')),
                country: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional()),
                city: z.string().optional().nullable().or(z.literal('')),
                state: z.number().optional().nullable(),
                po: z.string().optional().nullable().or(z.literal('')),
                pincode: z
                    .union([z.string(), z.number()])
                    .optional()
                    .nullable()
                    .transform((val) => (val ? String(val) : '')),
                ps: z.string().optional().nullable().or(z.literal(''))
            })
            .optional()
            .nullable(),
        motherOfficeAddress: z.string().optional().nullable(),

        motherOfficePhone: z.string().optional().nullable(),
        motherOccupation: z.string().optional().nullable(),
        motherDesignation: z.string().optional().nullable(),
        motherReligionId: z.number().int().optional().nullable(),
        motherCasteId: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ invalid_type_error: 'Select Caste' }).int().optional().nullable()
        ),
        motherSubCaste: z.string().optional().nullable(),
        motherTribe: z.string().optional().nullable(),
        motherChurchAffiliation: z.string().optional().nullable(),
        motherBankName: z.string().optional().nullable(),
        motherBankAccountNo: z.string().optional().nullable(),
        motherBankIFSCCode: z.string().optional().nullable(),
        motherBankBranch: z.string().optional().nullable(),
        motherAnnualIncome: z.number().optional().nullable(),

        amsT_MotherPermanentState: z.number().int().optional().nullable(),
        motherCasteCertificateNo: z.string().optional().nullable(),
        motherPAN: z.string().optional().nullable(),
        motherSelfEmployedFlg: z.boolean().optional(),

        //Step=4

        activities: z.array(z.string()).optional(),
        sourceDetails: z.array(z.string()).optional(),
        achievements: createOptionalStringSchema('Achievements', 1, 250),
        // Siblings Details (array, like add schema)
        siblings: z
            .array(
                z.object({
                    name: createOptionalAlphaNumericSchema('Sibling Name', 1, 150),
                    classId: z.number().min(0, 'Select a class').optional(),
                    relation: createOptionalAlphaNumericSchema('Relation', 1, 100)
                })
            )
            .optional(),

        // Guardians Details (array)
        guardian: z
            .array(
                z.object({
                    guardianName: createOptionalAlphaNumericSchema('Guardian Name', 1, 150),

                    guardianPhone: z
                        .string()
                        .optional()
                        .nullable()
                        .refine((v) => !v || (v.length >= 7 && v.length <= 20), 'Invalid phone number')
                        .refine((v) => !v || /^[0-9+\- ]+$/.test(v), 'Invalid phone format'),

                    guardianEmail: createEmailSchema('Guardian Email', 1, 150, true),
                    guardianAddress: createOptionalStringWithLettersSchema('Guardian Address', 1, 200)
                })
            )
            .optional(),

        // Previous School Details (array, like siblingsDetails)
        previousSchools: z
            .array(
                z.object({
                    schoolName: createOptionalAlphaNumericSchema('Previous School Name', 1, 150),

                    schoolTypeId: z.number({ required_error: 'School Type is required' }).min(1, 'School Type is required').optional(),
                    classId: z.number({ required_error: 'Class is required' }).min(1, 'Class is required').optional(),
                    percentage: createOptionalNumberOnlyPrecentageSchema('Percentage', 1, 10),
                    grade: createOptionalNumberOnlyStringSchema('Grade', 1, 10),
                    passedYear: z.number({ required_error: 'Passed Year is required' }).min(1900, 'Invalid year').optional(),
                    countryId: z.number({ required_error: 'Country is required' }).min(1, 'Country is required').optional(),
                    stateId: z.number({ required_error: 'State is required' }).min(1, 'State is required').optional(),
                    address: createOptionalStringWithLettersSchema('School Address', 1, 200),
                    leftReason: createStringOnlyOptionalSchema('Reason for Leaving', 1, 150),
                    medium: createStringOnlyOptionalSchema('Previous School Medium', 1, 100),
                    tcNumber: createOptionalAlphaNumericAllowBothSchema('TC Number', 1, 50),
                    tcDate: z.preprocess(
                        (val) =>
                            val && (typeof val === 'string' || typeof val === 'number' || val instanceof Date) ? new Date(val) : null,
                        z.date().nullable().optional()
                    )
                })
            )
            .optional(),
        // Place of Birth Details

        amsT_PlaceOfBirthCountry: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional()),
        amsT_PlaceOfBirthState: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional()),
        amsT_Distirct: createStringOnlyOptionalSchema('District', 1, 100).optional(),
        amsT_Taluk: createStringOnlyOptionalSchema('Taluk', 1, 100).optional(),
        amsT_Town: createStringOnlyOptionalSchema('Town', 1, 100).optional(),
        amsT_Village: createStringOnlyOptionalSchema('Village', 1, 100).optional(),

        // Siblings count fields validated as numeric-only strings (optional)
        amsT_NoOfSiblings: createOptionalNumberOnlyStringSchema('No of Siblings', 1, 2),
        amsT_NoOfSiblingsSchool: createOptionalNumberOnlyStringSchema('No of Siblings in School', 1, 2),
        amsT_NoOfDependencies: createOptionalNumberOnlyStringSchema('No of Siblings in Other School', 1, 2),

        amsT_Noofbrothers: createOptionalNumberOnlyStringSchema('No of Brothers', 1, 2),
        amsT_NoOfElderBrothers: createOptionalNumberOnlyStringSchema('No of Elder Brothers', 1, 2),
        amsT_NoOfYoungerBrothers: createOptionalNumberOnlyStringSchema('No of Younger Brothers', 1, 2),

        amsT_Noofsisters: createOptionalNumberOnlyStringSchema('No of Sisters', 1, 2),
        amsT_NoOfElderSisters: createOptionalNumberOnlyStringSchema('No of Elder Sisters', 1, 2),
        amsT_NoOfYoungerSisters: createOptionalNumberOnlyStringSchema('No of Younger Sisters', 1, 2),

        //Other Details
        pasA_AdmittingReason: createOptionalStringSchema('Admitting Reason', 1, 250),
        pasA_WillingToContributeRemarks: createOptionalStringSchema('Willing to Contribute Remarks', 1, 250),
        pasA_WillingToContributeFlg: z.number().int().optional(),

        //health
        amsT_Studentillness: createStringOnlyOptionalSchema('Student Illness', 1, 100).optional(),
        amsT_MedicalComplaints: createStringOnlyOptionalSchema('Medical Complaints', 1, 255).optional(),
        amsT_UnderAge: createOptionalNumberOnlyStringSchema('Under Age', 1, 2).optional(),
        amsT_Boarding: createStringOnlyOptionalSchema('Boarding', 1, 100).optional(),
        amsT_LastPlayGrndAttnd: createStringOnlyOptionalSchema('Last Playground Attended', 1, 255).optional(),
        amsT_AdmissionReason: createStringOnlyOptionalSchema('Admission Reason', 1, 255).optional(),
        amsT_OtherResidential_Addr: createOptionalStringSchema('Other Residential Address', 1, 255).optional(),
        amsT_SchoolDISECode: createOptionalStringSchema('School DISE Code', 1, 50).optional(),
        amsT_FirstLanguage: createStringOnlyOptionalSchema('First Language', 1, 100).optional(),
        amsT_SecondLanguage: createStringOnlyOptionalSchema('Second Language', 1, 100).optional(),
        amsT_Thirdlanguage: createStringOnlyOptionalSchema('Third Language', 1, 100).optional(),
        amsT_Illnessdetails: createOptionalStringSchema('Illness Details', 1, 500).optional(),
        amsT_OverAge: createOptionalNumberOnlyStringSchema('Over Age', 1, 2).optional(),
        amsT_OtherInformations: createOptionalStringSchema('Other Informations', 1, 500).optional(),
        amsT_ExtraActivity: createStringOnlyOptionalSchema('Extra Activity', 1, 100).optional(),
        amsT_Stayingwith: createStringOnlyOptionalSchema('Staying With', 1, 100).optional(),
        amsT_MaritalStatus: createStringOnlyOptionalSchema('Marital Status', 1, 50).optional(),
        amsT_OtherPermanentAddr: createOptionalStringSchema('Other Permanent Address', 1, 255).optional(),
        amsT_Domicile: createStringOnlyOptionalSchema('Domicile', 1, 100).optional(),

        amsT_TransferrableJobFlg: z.boolean().optional(),
        fatherSelfEmployedFlg: z.boolean().optional(),
        amsT_Tcflag: z.boolean().optional(),
        amsT_VaccinatedFlg: z.boolean().optional(),
        // Final flags for hostel and transport requirement
        hostelRequired: z.boolean().optional().default(false),
        transportRequired: z.boolean().optional().default(false),

        // Added missing fields
        imCC_Id: z.preprocess(
            (val) => (val === '' || val === null ? 0 : Number(val)),
            z.number({ required_error: 'Category is required', invalid_type_error: 'Select Category' }).min(1, 'Category is required')
        ),
        amsT_PENNo: createOptionalAlphaNumericSchema('PEN Number', 1, 50).optional(),
        amsT_Tribe: createOptionalAlphaNumericSchema('Tribe', 1, 100).optional(),
        amsT_GovtAdmno: createOptionalAlphaNumericSchema('Govt Admission No', 1, 50).optional(),
        amsT_Income: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().optional().nullable()),
        amsT_ration: createOptionalAlphaNumericSchema('Ration Card No', 1, 50).optional(),
        amsT_StudentPANNo: createOptionalAlphaNumericSchema('Student PAN', 1, 50).optional(),
        amsT_Stream: z.string().optional().nullable(),
        asmsT_Id: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().int().optional()),
        ASMCE_Id: z.preprocess((val) => (val === '' || val === null ? 0 : Number(val)), z.number().int().optional()),
        electivelist_Groups: z.array(z.number()).optional(),
        amsT_Remarks: createOptionalStringSchema('Remarks', 0, 500).optional()
    }),

    delete: z.object({
        pasr_id: deleteIdSchema('pasr_id')
    })
};
