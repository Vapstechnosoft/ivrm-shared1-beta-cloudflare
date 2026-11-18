'use server';
import { api } from '@/lib/apiService';

function withApiPrefix(path: string) {
    const baseUrl = api.getBaseUrl('admission');
    const baseHasApi = /\/api\/?$/.test(baseUrl);
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (baseHasApi) {
        return normalizedPath.replace(/^\/api(\/|$)/, '/');
    }
    return normalizedPath.startsWith('/api/') ? normalizedPath : `/api${normalizedPath}`;
}

/**
 * Loads initial data for DOB Certificate report (Academic Years, Classes, Sections)
 */
export async function getDobCertificateLoadData() {
    const url = withApiPrefix('/api/DOBcertificate/getdata');
    return await api.get<any>('admission', url);
}

/**
 * Fetches student list based on Academic Year, Class and Section
 */
export async function getDobCertificateStudentList(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
}) {
    // Keep URL format consistent with other report endpoints (see `custom_tc_report.ts`)
    const url = withApiPrefix(`/DOBcertificate/getstudbyclass?ASMAY_Id=${data.ASMAY_Id}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}`);

    // Some deployments expose this endpoint as GET, others as POST.
    // Our ApiService may throw a plain string without status, so fall back to POST on any GET failure.
    try {
        return await api.get<any>('admission', url);
    } catch (getError) {
        try {
            // POST fallback: send both querystring + body (different backends bind differently).
            // Some backends also expect Section as `ASMS_Id` in body.
            return await api.post<any>('admission', url, {
                ...data,
                ASMS_Id: data.ASMC_Id
            });
        } catch {
            throw getError;
        }
    }
}

/**
 * Fetches specific student details for the certificate
 */
export async function getDobCertificateDetails(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMC_Id: number;
    AMST_Id: number;
    AMC_Id: number;
}) {
    const url = withApiPrefix(
        `/DOBcertificate/getStudDetails?AMC_Id=${encodeURIComponent(String(data.AMC_Id))}&ASMC_Id=${encodeURIComponent(
            String(data.ASMC_Id)
        )}&ASMAY_Id=${encodeURIComponent(String(data.ASMAY_Id))}&ASMCL_Id=${encodeURIComponent(
            String(data.ASMCL_Id)
        )}&AMST_Id=${encodeURIComponent(String(data.AMST_Id))}`
    );

    // Some deployments expose this endpoint as GET, others as POST.
    // Our ApiService may throw a plain string without status, so fall back to POST on any GET failure.
    try {
        return await api.get<any>('admission', url);
    } catch (getError) {
        try {
            // POST fallback: send both querystring + body (different backends bind differently).
            // Legacy endpoint name differs across deployments, so keep both:
            // - modern: `/DOBcertificate/getStudDetails?...`
            // - legacy: `/DOBcertificate/Studdetails`
            // First try posting to the same URL (with querystring) and then to legacy.
            const payload = {
                ...data,
                ASMS_Id: data.ASMC_Id
            };

            try {
                return await api.post<any>('admission', url, payload);
            } catch {
                return await api.post<any>('admission', withApiPrefix('/DOBcertificate/Studdetails'), payload);
            }
        } catch {
            throw getError;
        }
    }
}
