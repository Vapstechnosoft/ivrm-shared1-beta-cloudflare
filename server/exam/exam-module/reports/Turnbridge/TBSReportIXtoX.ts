'use server';

import type { ApiResponse } from '@/lib/apiService';
import { getTBSReportSchool } from './TBSReportSchool';

/**
 * Server Action for Turnbridge IX to X Report Card
 * Reuses backend API `/JSHSExamReports_/promotion_report_TBSchool` via getTBSReportSchool
 */
export async function getTBSReportIXtoX(data: any): Promise<ApiResponse<any>> {
    return getTBSReportSchool(data);
}
