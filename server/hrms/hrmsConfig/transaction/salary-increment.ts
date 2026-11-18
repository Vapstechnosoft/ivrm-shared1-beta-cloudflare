'use server';
import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type {
    NewSalaryIncrementSaveRequest,
    NewSalaryIncrementSaveResponse,
    SalaryIncrementDeleteResponse,
    SalaryIncrementOnloadRequest,
    SalaryIncrementOnloadResponse,
    SalaryIncrementSaveRequest,
    SalaryIncrementSaveResponse
} from '@/types/hrms/salary-increment';
/**
 * Get salary increment onload details
 * POST /api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails
 */
export async function getSalaryIncrementOnload(
    payload: SalaryIncrementOnloadRequest
): Promise<ApiResponse<SalaryIncrementOnloadResponse> & { total?: number | null; page?: number | null; page_size?: number | null }> {
    console.log('📥 [SALARY INCREMENT - BACKEND] Request payload:', JSON.stringify(payload, null, 2));
    const url = '/api/EmployeeSalaryIncreementProcessFacade/onloadgetdetails';
    // Prepare request body - support both new and legacy formats
    const requestBody = {
        page: payload.page ?? 1,
        page_size: payload.page_size ?? 10,
        search_query: payload.search_query ?? '',
        search_column: payload.search_column ?? '',
        sort_column: payload.sort_column ?? '',
        sort_direction: payload.sort_direction ?? '',
        is_export: payload.is_export ?? false,
        MIID: payload.MIID ?? payload.MI_Id ?? 30,
        LoginUserId: payload.LoginUserId ?? payload.roleId ?? 0,
        UserRole: payload.UserRole ?? ''
    };
    console.log('📤 [SALARY INCREMENT - BACKEND] Request body prepared:', JSON.stringify(requestBody, null, 2));
    try {
        const response = await api.post<{
            success: boolean;
            message?: string;
            data?: SalaryIncrementOnloadResponse;
            total?: number | null;
            page?: number | null;
            page_size?: number | null;
        }>('hrms', url, requestBody);
        // The backend returns data wrapped in ApiResponse format
        if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
            // Already wrapped
            const responseData = response.data as any;
            // Map monthlydata to leaveyeardropdown if monthlydata exists
            if (responseData?.monthlydata && !responseData?.leaveyeardropdown) {
                responseData.leaveyeardropdown = responseData.monthlydata.map((item: any) => ({
                    HRMLY_Id: item.HRMLY_Id,
                    HRMLY_LeaveYear: item.HRMLY_LeaveYear,
                    HRMLY_FromDate: item.HRMLY_FromDate,
                    HRMLY_ToDate: item.HRMLY_ToDate
                }));
            }
            const mappedData = responseData as SalaryIncrementOnloadResponse;
            console.log('📊 [SALARY INCREMENT - BACKEND] Response data summary:', {
                hasMonths: !!mappedData?.monthdropdown?.length,
                monthsCount: mappedData?.monthdropdown?.length || 0,
                hasMonthlyData: !!responseData?.monthlydata?.length,
                monthlyDataCount: responseData?.monthlydata?.length || 0,
                hasLeaveYears: !!mappedData?.leaveyeardropdown?.length,
                leaveYearsCount: mappedData?.leaveyeardropdown?.length || 0,
                hasEmployees: !!mappedData?.employeelist?.length,
                employeesCount: mappedData?.employeelist?.length || 0,
                hasEarningDeductionTypes: !!mappedData?.earningdeductiontype?.length,
                earningDeductionTypesCount: mappedData?.earningdeductiontype?.length || 0,
                hasGridData: !!mappedData?.griddata?.length,
                gridDataCount: mappedData?.griddata?.length || 0,
                total: response.total,
                page: response.page,
                page_size: response.page_size
            });
            console.log('🔵 [SALARY INCREMENT - BACKEND] getSalaryIncrementOnload - END (Success)');
            return {
                ...response,
                data: mappedData
            } as ApiResponse<SalaryIncrementOnloadResponse> & { total?: number | null; page?: number | null; page_size?: number | null };
        }
        // Wrap raw response data (fallback for unexpected format)
        const rawData = response as any;
        // Map monthlydata to leaveyeardropdown if monthlydata exists
        if (rawData?.monthlydata && !rawData?.leaveyeardropdown) {
            rawData.leaveyeardropdown = rawData.monthlydata.map((item: any) => ({
                HRMLY_Id: item.HRMLY_Id,
                HRMLY_LeaveYear: item.HRMLY_LeaveYear,
                HRMLY_FromDate: item.HRMLY_FromDate,
                HRMLY_ToDate: item.HRMLY_ToDate
            }));
        }
        const wrappedResponse = {
            success: true,
            message: 'Data loaded successfully',
            data: rawData as SalaryIncrementOnloadResponse,
            total: undefined,
            page: undefined,
            page_size: undefined
        };
        console.log('📊 [SALARY INCREMENT - BACKEND] Response data summary:', {
            hasMonths: !!wrappedResponse.data?.monthdropdown?.length,
            monthsCount: wrappedResponse.data?.monthdropdown?.length || 0,
            hasMonthlyData: !!rawData?.monthlydata?.length,
            monthlyDataCount: rawData?.monthlydata?.length || 0,
            hasLeaveYears: !!wrappedResponse.data?.leaveyeardropdown?.length,
            leaveYearsCount: wrappedResponse.data?.leaveyeardropdown?.length || 0,
            hasEmployees: !!wrappedResponse.data?.employeelist?.length,
            employeesCount: wrappedResponse.data?.employeelist?.length || 0,
            hasEarningDeductionTypes: !!wrappedResponse.data?.earningdeductiontype?.length,
            earningDeductionTypesCount: wrappedResponse.data?.earningdeductiontype?.length || 0,
            hasGridData: !!wrappedResponse.data?.griddata?.length,
            gridDataCount: wrappedResponse.data?.griddata?.length || 0
        });
        console.log('🔵 [SALARY INCREMENT - BACKEND] getSalaryIncrementOnload - END (Success)');
        return wrappedResponse as unknown as ApiResponse<SalaryIncrementOnloadResponse> & {
            total?: number | null;
            page?: number | null;
            page_size?: number | null;
        };
    } catch (error) {
        console.error('💥 [SALARY INCREMENT - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
export async function saveSalaryIncrement(payload: SalaryIncrementSaveRequest) {
    const url = '/api/EmployeeSalaryIncreementProcessFacade';
    return await api.post<SalaryIncrementSaveResponse>('hrms', url, payload);
}
/**
 * Deactivate salary increment record by ID
 * POST /api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById?id={id}
 */
export async function deleteSalaryIncrement(id: number): Promise<ApiResponse<SalaryIncrementDeleteResponse>> {
    const url = '/api/EmployeeSalaryIncreementProcessFacade/deactivateRecordById';
    try {
        const response = await api.post<SalaryIncrementDeleteResponse>('hrms', url, undefined, {
            params: { id }
        });
        console.log('📤 [SALARY INCREMENT - BACKEND] Response:', JSON.stringify(response, null, 2));
        console.log('🔵 [SALARY INCREMENT - BACKEND] deleteSalaryIncrement - END (Success)');
        return response;
    } catch (error) {
        console.error('💥 [SALARY INCREMENT - BACKEND] Error message:', error instanceof Error ? error.message : String(error));
        throw error;
    }
}
/**
 * Get employee increment grid details
 * GET /api/TransEmployeeSalaryIncreementProcess/get_employee_increment_grid
 */
export async function getEmployeeIncrementGrid(searchParams?: ApiSearchparams): Promise<ApiResponse<any[]>> {
    const session = await auth();
    const MI_Id = session?.user?.mi_id || 30;

    // Map frontend column IDs to backend anonymous type properties
    const frontendToBackendMap: Record<string, string[]> = {
        'employeeName': ['FirstName', 'LastName'],
        'hrmD_DepartmentName': ['HRMD_DepartmentName'],
        'hreiC_IncrementDate': ['HREIC_IncrementDate'],
        'hrmeD_Name': ['HRMED_Name'],
        'PreviousAmount': ['HREICED_PreviousAmount'],
        'amount': ['Amount'],
        'flag': ['Flag']
    };

    let backendSearchColumns: string[] = [];
    if (searchParams?.search_columns) {
        const frontendCols = searchParams.search_columns.split(',');
        for (const col of frontendCols) {
            if (frontendToBackendMap[col]) {
                backendSearchColumns.push(...frontendToBackendMap[col]);
            } else {
                backendSearchColumns.push(col); // Fallback
            }
        }
    }

    if (backendSearchColumns.length === 0) {
        backendSearchColumns = ['FirstName', 'LastName', 'HRMD_DepartmentName', 'HRMED_Name', 'HREICED_PreviousAmount', 'Amount', 'Flag'];
    }

    const searchColumns = backendSearchColumns.join(',');

    let sortColumn = searchParams?.sort_column;
    if (sortColumn && frontendToBackendMap[sortColumn]) {
        sortColumn = frontendToBackendMap[sortColumn][0]; // Pick the first mapped column for sorting
    }

    // Build query parameters carefully like this update what are the columns to filter
    let queryUrl = `MI_Id=${MI_Id}`;

    if (searchParams) {
        if (searchParams.page) queryUrl += `&page=${searchParams.page}`;
        if (searchParams.page_size) queryUrl += `&page_size=${searchParams.page_size}`;
        if (sortColumn) queryUrl += `&sort_column=${sortColumn}`;
        if (searchParams.sort_direction) queryUrl += `&sort_direction=${searchParams.sort_direction}`;
        if (searchParams.search_query) {
            queryUrl += `&search_query=${encodeURIComponent(searchParams.search_query)}`;
            queryUrl += `&search_column=${encodeURIComponent(searchColumns)}`;
        }
    }

    const url = `/api/TransEmployeeSalaryIncreementProcess/get_employee_increment_grid?${queryUrl}`;
    
    try {
        const response = await api.get<any[]>('hrms', url);
        return response;
    } catch (error) {
        console.error('Error fetching increment grid:', error);
        throw error;
    }
}

/**
 * Delete employee increment record
 * POST /api/TransEmployeeSalaryIncreementProcess/delete_master_holiday/{id}
 */
export async function deleteEmployeeIncrementMaster(id: number): Promise<ApiResponse<any>> {
    const url = `/api/TransEmployeeSalaryIncreementProcess/delete_master_holiday/${id}`;
    try {
        const response = await api.delete<any>('hrms', url);
        return response;
    } catch (error) {
        console.error('Error deleting increment:', error);
        throw error;
    }
}

/**
 * Add or update employee salary increment (Bulk)
 * POST /api/TransEmployeeSalaryIncreementProcess/add_or_update_employee_salary_increment
 */
export async function addOrUpdateEmployeeSalaryIncrement(
    payload: NewSalaryIncrementSaveRequest
): Promise<ApiResponse<NewSalaryIncrementSaveResponse>> {
    const url = '/api/TransEmployeeSalaryIncreementProcess/add_or_update_employee_salary_increment';
    try {
        const response = await api.post<NewSalaryIncrementSaveResponse>('hrms', url, payload);
        return response as any;
    } catch (error) {
        console.error('Error in addOrUpdateEmployeeSalaryIncrement:', error);
        throw error;
    }
}
