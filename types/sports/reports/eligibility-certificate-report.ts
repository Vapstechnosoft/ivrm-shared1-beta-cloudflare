import { z } from 'zod';

export interface IEligibilityCertificateReportDetail {
    amsT_Id: number;
    adm_no?: string;
    studentname: string;
    classname?: string;
    asmcL_ClassName?: string;
    sectionname?: string;
    asmC_SectionName?: string;
    gender?: string;
    amst_dob?: string | Date;
    dob?: string | Date;
    fatherName?: string;
    motherName?: string;
    Selected?: boolean;
    // Additional fields from API
    amst_id?: number;
    amst_firstname?: string;
    asmcl_classname?: string;
    asmc_sectionname?: string;
    asmcl_id?: number;
    asms_id?: number;
    spccmsccg_id?: number;
    spccmsccg_sportsccgroupname?: string;
}

export interface IEligibilityCertificateReport {
    optionflag: 'SCHOOL' | 'COLLEGE';
    asmaY_Id: number;
    asmaY_Year?: string;
    asmcL_Id: number;
    asmS_Id: number;
    spccmE_Id: number;
    amsT_Date: Date | string;
    spccsH_Age?: string;
    spccmE_EventName?: string;
    amsT_Id?: number;
    studentList?: IEligibilityCertificateReportDetail[];
    studentList1?: IEligibilityCertificateReportDetail[];
}

export const eligibilityCertificateReportSchema = z.object({
    optionflag: z.enum(['SCHOOL', 'COLLEGE']),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    asmaY_Year: z.string().optional(),
    asmcL_Id: z.coerce.number().min(1, 'Class is required'),
    asmS_Id: z.coerce.number().min(1, 'Section is required'),
    spccmE_Id: z.coerce.number().min(1, 'Event Name is required'),
    amsT_Date: z.union([z.date(), z.string()]).refine((val) => val !== null && val !== '', 'Date is required'),
    spccsH_Age: z.string().optional(),
    amsT_Id: z.coerce.number().min(1, 'Student is required'),
    spccmE_EventName: z.string().optional()
});
