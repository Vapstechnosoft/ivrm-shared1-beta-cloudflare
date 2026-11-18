'use client';

import { getEmployeeAdvanceReportOnload, searchEmployeeAdvanceReport } from '@/server/hrms/hrmsConfig/reports/advance-report';
import { getBankCashReportOnload, searchBankCashReport } from '@/server/hrms/hrmsConfig/reports/bank-cash-report';
import {
    getEmployeeContributionReportOnload,
    searchEmployeeContributionDetails
} from '@/server/hrms/hrmsConfig/reports/employee-contribution-report';
import { searchEmployeeProfileDetails } from '@/server/hrms/hrmsConfig/reports/employee-profile-report';
import { getEmployeeStrengthReportOnload, searchEmployeeStrengthReport } from '@/server/hrms/hrmsConfig/reports/employee-strength-report';
import { getESIReportOnload } from '@/server/hrms/hrmsConfig/reports/esi-report';
import { getPFChallanReportOnload } from '@/server/hrms/hrmsConfig/reports/pf-challan-report';
import { getPFForm3ABasicData, searchPFForm3AReport } from '@/server/hrms/hrmsConfig/reports/pf-form-3a-report';
import {
    filterEmployeesByYearMonth,
    generateSalarySlip,
    getSalarySlipOnload,
    sendSalarySlipEmailSMSWhatsApp
} from '@/server/hrms/hrmsConfig/reports/salary-slip-report';
import {
    getMasterDepartments,
    getMasterDesignations,
    getMasterEmployeeTypes,
    getMasterGroupTypes,
    getMasterMonths,
    getMasterPaymentModeList,
    getMasterYears
} from '@/server/hrms/master';
import { type BankCashReportRequest, getEmployeesBankCashReport } from '@/server/hrms/reports/bank-cash-report';
import {
    type CumulativeSalaryReportRequest,
    getCumulativeSalaryReport,
    getDepartmentsByGroupType,
    getDesignationsByGroupAndDept,
    getEmployeesByDeptAndDesignation,
    getEmployeesByGroupTypeDeptAndDesignation,
    getGroupTypes
} from '@/server/hrms/reports/cumulative-salary-report';
import { type DepartmentSalaryReportRequest, getDepartmentSalaryReport } from '@/server/hrms/reports/department-salary-report';
import {
    type EmployeeDetailsReportRequest,
    filterEmployeeDetailsReport,
    getEmployeeAndEmployeeType,
    getEmployeeDetailsReportOnload,
    getLoginBasedDepartmentsByGroupType,
    searchEmployeeDetailsReport
} from '@/server/hrms/reports/employee-details-report';
import {
    getEmployeeLetterDetails,
    getEmployeeOfferAndExperienceReport,
    getEmployeesByFilter
} from '@/server/hrms/reports/employee-offer-letter';
import { getMonthWiseSalaryDetails, getYearWiseSalaryDetails } from '@/server/hrms/reports/employee-salary-details';
import {
    type ESIReportRequest,
    type PFChallanRequest,
    type PFForm5Request,
    type PFForm6ARequest,
    type PFForm10Request,
    type PFSummaryReportRequest,
    getESIReport,
    getPFChallan,
    getPFForm5,
    getPFForm6A,
    getPFForm10,
    getPFSummaryReport,
    getVPFSummaryReport
} from '@/server/hrms/reports/esi-pf-reports';
import { type HeadWiseReportRequest, getHeadWiseEmployeeDetails } from '@/server/hrms/reports/head-wise-report';
import { type LeaveReportRequest, getLeaveReport } from '@/server/hrms/reports/leave-report';
import { type LeaveStatusReportRequest, getLeaveStatusReport } from '@/server/hrms/reports/leave-status-report';
import { type MonthEndReportRequest, getMonthEndReport } from '@/server/hrms/reports/month-end-report';
import type { EmployeeProfileReportSearchRequest } from '@/types/hrms/reports/employee-profile-report';
import type { SalarySlipFilterRequest, SalarySlipGenerateRequest } from '@/types/hrms/reports/salary-slip-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export type { EmployeeDetailsReportRequest };

import {
    getDepartmentsByGroupType as getMasterDropdownDepartments,
    getDesignationsByDepartment as getMasterDropdownDesignations,
    getEmployeesByDeptAndDesignation as getMasterDropdownEmployees,
    getGroupTypes as getMasterDropdownGroupTypes
} from '@/server/hrms/master-dropdown';
import { toast } from 'sonner';

import { type PS7ReportDataRequest, getPS7ReportData, getPS7ReportEmployees } from '@/server/hrms/reports/PS7FromReportStJames';
import { type PS8MonthWiseReportDataRequest, getPS8MonthWiseReportData } from '@/server/hrms/reports/PS8_MonthWiseReportStjames';
import {
    type ContributionEmployeesRequest,
    type ContributionReportRequest,
    getContributionEmployees,
    getContributionReport
} from '@/server/hrms/reports/contribution-report';
import { type LoanReportRequest, getEmployeesLoanReport } from '@/server/hrms/reports/loan-report';
import {
    getSalaryCertificateEmployees,
    getSalaryCertificateReport,
    type salaryCertificateEmployeesRequest,
    type salaryCertificateRequest
} from '@/server/hrms/reports/salary-certificate';

export function useCumulativeSalaryReport() {
    return useMutation({
        mutationFn: (data: CumulativeSalaryReportRequest) => getCumulativeSalaryReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch report');
        }
    });
}

export function useReportGroupTypes() {
    return useQuery({
        queryKey: ['report-group-types'],
        queryFn: () => getGroupTypes(),
        staleTime: 1000 * 60 * 10
    });
}

export function useReportDepartments(groupTypeIds: string) {
    return useQuery({
        queryKey: ['report-departments', groupTypeIds],
        queryFn: () => getDepartmentsByGroupType(groupTypeIds),
        enabled: !!groupTypeIds && groupTypeIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

export function useReportDesignations(groupTypeIds: string, deptIds: string) {
    return useQuery({
        queryKey: ['report-designations', groupTypeIds, deptIds],
        queryFn: () => getDesignationsByGroupAndDept(groupTypeIds, deptIds),
        enabled: !!groupTypeIds && !!deptIds,
        staleTime: 1000 * 60 * 5
    });
}

export function useReportEmployeesByDeptAndDesignation(deptIds: string, desigIds: string) {
    return useQuery({
        queryKey: ['report-employees', deptIds, desigIds],
        queryFn: () => getEmployeesByDeptAndDesignation(deptIds, desigIds),
        enabled: !!deptIds && !!desigIds,
        staleTime: 1000 * 60 * 5
    });
}

// Get EMployees by Group Type, Department and Designation

export function useReportEmployeesByGroupTypeDeptAndDesignation(groupTypeIds: number[], deptIds: number[], desigIds: number[]) {
    return useQuery({
        queryKey: ['report-employees', groupTypeIds, deptIds, desigIds],
        queryFn: () => getEmployeesByGroupTypeDeptAndDesignation(groupTypeIds, deptIds, desigIds),
        enabled:
            Array.isArray(groupTypeIds) &&
            groupTypeIds.length > 0 &&
            Array.isArray(deptIds) &&
            deptIds.length > 0 &&
            Array.isArray(desigIds) &&
            desigIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

export function useDepartmentSalaryReport() {
    return useMutation({
        mutationFn: (data: DepartmentSalaryReportRequest) => getDepartmentSalaryReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch report');
        }
    });
}

/**
 * Hook for Employee Advance Report Onload
 */
export function useEmployeeAdvanceReportOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['employee-advance-report-onload', MI_Id, LogInUserId],
        queryFn: () => getEmployeeAdvanceReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for Bank Cash Report Onload
 */
export function useBankCashReportOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['bank-cash-report-onload', MI_Id, LogInUserId],
        queryFn: () => getBankCashReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for searching Bank Cash Report
 */
export function useSearchBankCashReport() {
    return useMutation({
        mutationFn: (data: any) => searchBankCashReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to search bank cash report');
        }
    });
}

export function useMasterGroupTypes() {
    return useQuery({
        queryKey: ['master-group-types'],
        queryFn: () => getMasterGroupTypes(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterDepartments() {
    return useQuery({
        queryKey: ['master-departments'],
        queryFn: () => getMasterDepartments(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterDesignations() {
    return useQuery({
        queryKey: ['master-designations'],
        queryFn: () => getMasterDesignations(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterMonths() {
    return useQuery({
        queryKey: ['master-months'],
        queryFn: () => getMasterMonths(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterYears() {
    return useQuery({
        queryKey: ['master-years'],
        queryFn: () => getMasterYears(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterPaymentModeList() {
    return useQuery({
        queryKey: ['master-payment-mode-list'],
        queryFn: () => getMasterPaymentModeList(),
        staleTime: 1000 * 60 * 10
    });
}

export function useMasterEmployeeTypes() {
    return useQuery({
        queryKey: ['master-employee-types'],
        queryFn: () => getMasterEmployeeTypes(),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for searching Employee Advance Report
 */
export function useSearchEmployeeAdvanceReport() {
    return useMutation({
        mutationFn: (data: any) => searchEmployeeAdvanceReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to search employee advance report');
        }
    });
}

export function useEmployeeStrengthReport() {
    return useMutation({
        mutationFn: (data: any) => searchEmployeeStrengthReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch strength report');
        }
    });
}

export function useEmployeeStrengthOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['employee-strength-report-onload', MI_Id, LogInUserId],
        queryFn: () => getEmployeeStrengthReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

export function useReportEmployees(designationId: number, deptId: number, groupTypeId: number) {
    return useQuery({
        queryKey: ['report-employees-filter', designationId, deptId, groupTypeId],
        queryFn: () => getEmployeesByFilter(designationId, deptId, groupTypeId),
        enabled: !!designationId && !!deptId && !!groupTypeId,
        staleTime: 1000 * 60 * 5
    });
}

export function useEmployeeLetterDetails() {
    return useMutation({
        mutationFn: ({
            designationId,
            deptId,
            groupTypeId,
            employeeId
        }: { designationId: number; deptId: number; groupTypeId: number; employeeId: number }) =>
            getEmployeeLetterDetails(designationId, deptId, groupTypeId, employeeId),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch details');
        }
    });
}

export function useESIReport() {
    return useMutation({
        mutationFn: (data: ESIReportRequest) => getESIReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch ESI report');
        }
    });
}

export function useESIReportOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['esi-report-onload', MI_Id, LogInUserId],
        queryFn: () => getESIReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

export function usePFForm10() {
    return useMutation({
        mutationFn: (data: PFForm10Request) => getPFForm10(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Form 10');
        }
    });
}

export function usePFForm5() {
    return useMutation({
        mutationFn: (data: PFForm5Request) => getPFForm5(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Form 5');
        }
    });
}

export function usePFChallan() {
    return useMutation({
        mutationFn: (data: PFChallanRequest) => getPFChallan(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Challan');
        }
    });
}

export function usePFChallanOnload(MI_Id: number) {
    return useQuery({
        queryKey: ['pf-challan-onload', MI_Id],
        queryFn: () => getPFChallanReportOnload(MI_Id),
        staleTime: 1000 * 60 * 10
    });
}

export function usePFForm3ABasicData() {
    return useQuery({
        queryKey: ['pf-form3a-basic-data'],
        queryFn: () => getPFForm3ABasicData(),
        staleTime: 1000 * 60 * 10
    });
}

export function useSearchPFForm3AReport() {
    return useMutation({
        mutationFn: (data: any) => searchPFForm3AReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to search PF Form 3A report');
        }
    });
}

export function usePFForm6A() {
    return useMutation({
        mutationFn: (data: PFForm6ARequest) => getPFForm6A(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch PF Form 6A');
        }
    });
}

export function useEmployeeContributionOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['employee-contribution-onload', MI_Id, LogInUserId],
        queryFn: () => getEmployeeContributionReportOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

export function useSearchEmployeeContribution() {
    return useMutation({
        mutationFn: (data: any) => searchEmployeeContributionDetails(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch employee contribution');
        }
    });
}

/**
 * Hook for Salary Slip Onload
 */
export function useSalarySlipOnload(MI_Id: number, LogInUserId: number) {
    return useQuery({
        queryKey: ['salary-slip-onload', MI_Id, LogInUserId],
        queryFn: () => getSalarySlipOnload(MI_Id, LogInUserId),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for Filtering Employees for Salary Slip
 */
export function useFilterEmployeesByYearMonth() {
    return useMutation({
        mutationFn: (data: SalarySlipFilterRequest) => filterEmployeesByYearMonth(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter employees');
        }
    });
}

/**
 * Hook for Generating Salary Slip
 */
export function useGenerateSalarySlip() {
    return useMutation({
        mutationFn: (data: SalarySlipGenerateRequest) => generateSalarySlip(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to generate salary slip');
        }
    });
}

/**
 * Hook for Sending Salary Slip via Email/SMS/WhatsApp
 */
export function useSendSalarySlipEmailSMS() {
    return useMutation({
        mutationFn: (data: any) => sendSalarySlipEmailSMSWhatsApp(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to send salary slip');
        }
    });
}

/**
 * Hook for Year-wise Employee Salary Details
 */
export function useYearWiseSalaryDetails(year: string) {
    return useQuery({
        queryKey: ['year-wise-salary-details', year],
        queryFn: () => getYearWiseSalaryDetails(year),
        enabled: !!year,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for Month-wise Employee Salary Details (Department breakdown)
 */
export function useMonthWiseSalaryDetails(year: string, month: string) {
    return useQuery({
        queryKey: ['month-wise-salary-details', year, month],
        queryFn: () => getMonthWiseSalaryDetails(year, month),
        enabled: !!year && !!month,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for fetching Group Types for cascading dropdowns
 * Used in leave report and other forms
 */
export function useLeaveReportGroupTypes() {
    return useQuery({
        queryKey: ['leave-report-group-types'],
        queryFn: async () => {
            const response = await getMasterDropdownGroupTypes();
            return response.data || [];
        },
        staleTime: 1000 * 60 * 10
    });
}
export function useEmployeeDetailsReportOnload() {
    return useQuery({
        queryKey: ['employee-details-report-onload'],
        queryFn: () => getEmployeeDetailsReportOnload(),
        staleTime: 1000 * 60 * 10
    });
}
/**
 * Hook for Searching Employee Details Report
 */
export function useSearchEmployeeDetailsReport() {
    return useMutation({
        mutationFn: (data: EmployeeDetailsReportRequest) => searchEmployeeDetailsReport(data),
        onError: (error: Error) => {
            console.error('SEARCH MUTATION ERROR:', error);
            toast.error(error.message || 'Failed to fetch report');
        }
    });
}

/**
 * Hook for Filtering Employee Details
 */
export function useFilterEmployeeDetails() {
    return useMutation({
        mutationFn: (data: any) => filterEmployeeDetailsReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to filter data');
        }
    });
}

/**
 * Hook for fetching Employee and Employee Type
 */
export function useEmployeeAndEmployeeType() {
    return useMutation({
        mutationFn: (data: any) => getEmployeeAndEmployeeType(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch employee types');
        }
    });
}

/**
 * Hook for fetching Departments based on Group Type selection
 */
export function useLoginBasedDepartments(groupTypeIds: number[]) {
    return useQuery({
        queryKey: ['login-based-departments', groupTypeIds],
        queryFn: () => getLoginBasedDepartmentsByGroupType(groupTypeIds),
        enabled: !!groupTypeIds && groupTypeIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}
/**
 * Hook for fetching Departments by Group Type IDs
 * Cascades from Group Type selection
 */
export function useLeaveReportDepartments(groupTypeIds: number[]) {
    return useQuery({
        queryKey: ['leave-report-departments', groupTypeIds],
        queryFn: async () => {
            if (!groupTypeIds || groupTypeIds.length === 0) {
                return [];
            }
            const response = await getMasterDropdownDepartments(groupTypeIds);
            return response.data || [];
        },
        enabled: !!groupTypeIds && groupTypeIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for fetching Designations by Department IDs
 * Cascades from Department selection
 */
export function useLeaveReportDesignations(departmentIds: number[]) {
    return useQuery({
        queryKey: ['leave-report-designations', departmentIds],
        queryFn: async () => {
            if (!departmentIds || departmentIds.length === 0) {
                return [];
            }
            const response = await getMasterDropdownDesignations(departmentIds);
            return response.data || [];
        },
        enabled: !!departmentIds && departmentIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for fetching Employees using the MasterDropDown API
 * Recommended by user: GET /api/MasterDropDown/employees_drop_down_by_dept_and_designation/{hrmd_ids}/{hrmdes_ids}
 */
export function usePeriodLeaveReportEmployees(departmentIds: number[], designationIds: number[]) {
    return useQuery({
        queryKey: ['period-leave-report-employees', departmentIds, designationIds],
        queryFn: async () => {
            console.log('📡 [HOOK] Fetching employees with:', { departmentIds, designationIds });

            if (!departmentIds || departmentIds.length === 0 || !designationIds || designationIds.length === 0) {
                console.log('⚠️ [HOOK] Missing departments or designations, skipping fetch');
                return [];
            }

            try {
                // Directly call the MasterDropDown API server action
                const response = await getMasterDropdownEmployees(departmentIds, designationIds);
                console.log('✅ [HOOK] API Response:', response);
                return response.data || [];
            } catch (error) {
                console.error('❌ [HOOK] API Error:', error);
                throw error;
            }
        },
        enabled: !!departmentIds && departmentIds.length > 0 && !!designationIds && designationIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

export function useLeaveStatusReport() {
    return useMutation({
        mutationFn: (data: LeaveStatusReportRequest) => getLeaveStatusReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Leave Status Report');
        }
    });
}

// Get employees based on the hrmE_IdList
export function useEmployeeProfileReport() {
    return useMutation({
        mutationFn: (data: EmployeeProfileReportSearchRequest) => searchEmployeeProfileDetails(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Employee Profile Report');
        }
    });
}

/**
 * Hook for Bank Cash Report
 */
export function useBankCashReport() {
    return useMutation({
        mutationFn: (data: BankCashReportRequest) => getEmployeesBankCashReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Bank Cash Report');
        }
    });
}
/**
 * Hook for Head wise Report
 */
export function useHeadWiseReport() {
    return useMutation({
        mutationFn: (data: HeadWiseReportRequest) => getHeadWiseEmployeeDetails(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Head wise Report');
        }
    });
}

/**
 * Hook for Month End Report
 */
export function useMonthEndReport() {
    return useMutation({
        mutationFn: (data: MonthEndReportRequest) => getMonthEndReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Month End Report');
        }
    });
}

/**
 * Hook for Loan Report
 */
export function useLoanReport() {
    return useMutation({
        mutationFn: (data: LoanReportRequest) => getEmployeesLoanReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Loan Report');
        }
    });
}

/**
 * Hook for Contribution Report
 */
export function useContributionReport() {
    return useMutation({
        mutationFn: (data: ContributionReportRequest) => getContributionReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Contribution Report');
        }
    });
}

/**
 * Hook for Contribution Employees Report
 */
export function useContributionEmployees() {
    return useMutation({
        mutationFn: (data: ContributionEmployeesRequest) => getContributionEmployees(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Contribution Employees Report');
        }
    });
}

/**
 * Hook for Salary Certificate Report
 */
export function useSalaryCertificateReport() {
    return useMutation({
        mutationFn: (data: salaryCertificateRequest) => getSalaryCertificateReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Salary Certificate Report');
        }
    });
}

/**
 * Hook for Salary Certificate Report Employees
 */

export function useSalaryCertificateEmployees() {
    return useMutation({
        mutationFn: (data: salaryCertificateEmployeesRequest) => getSalaryCertificateEmployees(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch the employess');
        }
    });
}

/**
 * Hook for get the Departements based on login (Group Type) EmployeeRetirementReport
 */

export function useLoginBasedDepartmentsByGroupType(groupTypeIds: number[]) {
    return useQuery({
        queryKey: ['login-based-departments', groupTypeIds],
        queryFn: () => getLoginBasedDepartmentsByGroupType(groupTypeIds),
        enabled: !!groupTypeIds && groupTypeIds.length > 0,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook for get the PS7 Report Employees
 */

export function usePS7ReportEmployees() {
    return useQuery({
        queryKey: ['ps7-report-employees'],
        queryFn: () => getPS7ReportEmployees(),
        staleTime: 1000 * 60 * 10
    });
}

/**
 * Hook for get the PS7 Report Data
 */

export function usePS7ReportData() {
    return useMutation({
        mutationFn: (data: PS7ReportDataRequest) => getPS7ReportData(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch the PS7 Report Data');
        }
    });
}

/**
 * Hook for PS8 Month Wise Report (st.james)
 */

export function usePS8MonthWiseReportStJames() {
    return useMutation({
        mutationFn: (data: PS8MonthWiseReportDataRequest) => getPS8MonthWiseReportData(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch the PS8 Month Wise Report');
        }
    });
}

/**
 * Hook for PF Summary Report and PF Yearly Report
 */
export function usePFSummaryReport() {
    return useMutation({
        mutationFn: (data: PFSummaryReportRequest) => getPFSummaryReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch the PF Summary Report');
        }
    });
}

/**
 * Hook for VPF Summary Report and VPF Yearly Report
 */

export function useVPFSummaryReport() {
    return useMutation({
        mutationFn: (data: PFSummaryReportRequest) => getVPFSummaryReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch the VPF Summary Report');
        }
    });
}

export function useEmployeeOfferAndExperienceReport() {
    return useMutation({
        mutationFn: (payload: {
            HRME_Id: number;
            HRMGT_Id: number;
            HRMD_Id: number;
            HRMDES_Id: number;
        }) => getEmployeeOfferAndExperienceReport(payload),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch employee offer and experience report');
        }
    });
}

/**
 * Hook for Leave Report
 */
export function useLeaveReport() {
    return useMutation({
        mutationFn: (data: LeaveReportRequest) => getLeaveReport(data),
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to fetch Leave Report');
        }
    });
}
