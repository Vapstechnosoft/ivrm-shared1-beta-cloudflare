'use server';

import { type ApiResponse, api } from '@/lib/apiService';
import type {
    IEligibilityCertificateReport,
    IEligibilityCertificateReportDetail
} from '@/types/sports/reports/eligibility-certificate-report';

export async function getEligibilityCertificateReport(): Promise<ApiResponse<any>> {
    return await api.post('sports', 'HSEligibilityCerficate/Getdetails', { asmaY_Id: 0 });
}

export async function getClasses(data: any): Promise<ApiResponse<any>> {
    return await api.post('sports', 'HSEligibilityCerficate/get_class', data);
}

export async function getSections(data: any): Promise<ApiResponse<any>> {
    return await api.post('sports', 'SportTopperListReport/get_section', data);
}

export async function getStudents(data: any): Promise<ApiResponse<any>> {
    return await api.post('sports', 'SportTopperListReport/get_student', data);
}

export async function getAge(data: any): Promise<ApiResponse<any>> {
    return await api.post('sports', 'HSEligibilityCerficate/get_age', data);
}

export async function getCertificate(data: any): Promise<ApiResponse<any>> {
    return await api.post('sports', 'HSEligibilityCerficate/get_certificate', data);
}

export async function getPUCertificate(data: any): Promise<ApiResponse<any>> {
    return await api.post('sports', 'HSEligibilityCerficate/get_PUcertificate', data);
}

export async function generateEligibilityCertificateReport(
    data: IEligibilityCertificateReport
): Promise<ApiResponse<IEligibilityCertificateReportDetail[]>> {
    if (data.optionflag === 'SCHOOL') {
        return await api.post('sports', 'HSEligibilityCerficate/get_certificate', data);
    } else {
        return await api.post('sports', 'HSEligibilityCerficate/get_PUcertificate', data);
    }
}
