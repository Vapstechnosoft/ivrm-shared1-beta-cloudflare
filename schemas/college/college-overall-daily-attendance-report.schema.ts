import { z } from 'zod';

export const collegeOverallDailyAttendanceSchema = z.object({
    asmaY_Id: z.coerce.number().min(1, 'Please select Academic Year'),
    fromdate: z.date({
        required_error: 'Please select Date',
        invalid_type_error: 'Please select Date'
    })
});

export type CollegeOverallDailyAttendanceFormData = z.infer<typeof collegeOverallDailyAttendanceSchema>;

export interface AttendanceRecord {
    AMB_Id: number;
    AMSE_Id: number;
    AMB_BranchName: string;
    AMSE_SEMName: string;
    TOTAL: number;
    PRESENT: number;
    ABSENT: number;
    AMB_Order?: number;
    HALFDAY?: number;
    Id?: string | number;
    selected?: boolean;
}

export interface AbsenteeTeacherRecord {
    Id?: string | number;
    StudentId?: number;
    Name: string;
    EmployeeName?: string;
    HRME_EmployeeFirstName?: string;
    ABSENT: number;
    PRESENT?: number;
    TOTAL?: number;
    AMB_BranchName?: string;
    AMSE_SEMName?: string;
    selected_model?: boolean;
}
