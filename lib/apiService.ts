export interface PaginationData {
    total: number;
    page: number;
    page_Size: number;
}

export interface ApiResponse<T> extends Partial<PaginationData> {
    success: boolean;
    message: string;
    data: T | null;
    rawResponse?: any; // Added to preserve full legacy response
    [key: string]: unknown;
}

export interface ApiArrayResponse<T> extends Partial<PaginationData> {
    success: boolean;
    message: string;
    data: {
        $type: string;
        $values: T[];
    } | null;
    [key: string]: unknown;
}
import type { ApiSearchparams } from '@/types';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

// Define available API base URLs

export type ApiBaseUrlKey =
    | 'default'
    | 'preadmission'
    | 'admission'
    | 'college'
    | 'fees'
    | 'exam'
    | 'naac'
    | 'hrms'
    | 'hrmsfrontoffice'
    | 'hmslms'
    | 'library'
    | 'timetable'
    | 'inventory'
    | 'sports'
    | 'alumni'
    | 'sadmin'
    | 'portal'
    | 'hostel'
    | 'coe'
    | 'lessonplanner'
    | 'transport'
    | 'pettycashandassettracking'
    | 'hrmsrecruitment'
    | 'collegepreadmission'
    | 'visitors';

class ApiService {
    private instances: Map<string, AxiosInstance>;
    private baseUrls: Record<ApiBaseUrlKey, string>;

    constructor() {
        this.instances = new Map();

        // Map your environment variables to base URLs
        this.baseUrls = {
            default: process.env.NEXT_PUBLIC_API_BASE_URL || '',
            preadmission: process.env.NEXT_PUBLIC_PREADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            admission: process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            fees: process.env.NEXT_PUBLIC_FEES_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            exam: process.env.NEXT_PUBLIC_EXAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            naac: process.env.NEXT_PUBLIC_NAAC_API_BASE_URL || 'http://localhost:5000/api',
            hostel: process.env.NEXT_PUBLIC_HOSTEL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrms: process.env.NEXT_PUBLIC_HRMS_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrmsfrontoffice: process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hmslms: process.env.NEXT_PUBLIC_HRMS_LMS_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',

            library: process.env.NEXT_PUBLIC_LIBRARY_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            timetable: process.env.NEXT_PUBLIC_TIMETABLE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            inventory: process.env.NEXT_PUBLIC_INVENTORY_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            sports: process.env.NEXT_PUBLIC_SPORTS_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            alumni: process.env.NEXT_PUBLIC_ALUMNI_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            sadmin: process.env.NEXT_PUBLIC_SADMIN_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            coe: process.env.NEXT_PUBLIC_COE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            portal: process.env.NEXT_PUBLIC_PORTAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            lessonplanner: process.env.NEXT_PUBLIC_LESSONPLANNER_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            transport: process.env.NEXT_PUBLIC_TRANSPORT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            pettycashandassettracking: process.env.NEXT_PUBLIC_PETTYCASH_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrmsrecruitment: process.env.NEXT_PUBLIC_HRMS_RECRUITMENT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            college: process.env.NEXT_PUBLIC_COLLEGE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            collegepreadmission: process.env.NEXT_PUBLIC_COLLEGEPREADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            visitors:
                process.env.NEXT_PUBLIC_VISITORS_API_BASE_URL ||
                (process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL
                    ? process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL.endsWith('/api')
                        ? process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL
                        : `${process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL}/api`
                    : '') ||
                process.env.NEXT_PUBLIC_API_BASE_URL ||
                ''
        };

        // Debug: info base URLs in development
        if (process.env.NODE_ENV === 'development') {
            console.info('🔵 [API SERVICE] Base URLs initialized:');
            console.info('🔵 [API SERVICE] hmslms:', this.baseUrls.hmslms || 'NOT SET');
            console.info('🔵 [API SERVICE] NEXT_PUBLIC_HRMS_LMS_BASE_URL:', process.env.NEXT_PUBLIC_HRMS_LMS_BASE_URL || 'NOT SET');
        }

        // Initialize default instance
        this.getOrCreateInstance('default');
    }

    public getBaseUrl(key: ApiBaseUrlKey | string): string {
        if (key === 'exam') {
            return (
                process.env.NEXT_PUBLIC_EXAM_LOCAL_API_BASE_URL ||
                process.env.EXAM_API_BASE_URL ||
                process.env.NEXT_PUBLIC_EXAM_API_BASE_URL ||
                'https://localhost:50258/api'
            );
        }
        if (key === 'visitors' || key === 'hrmsfrontoffice') {
            return (
                process.env.NEXT_PUBLIC_VISITORS_API_BASE_URL ||
                process.env.VISITORS_API_BASE_URL ||
                process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL ||
                process.env.HRMS_FRONTOFFICE_BASE_URL ||
                'http://localhost:50198/api'
            );
        }
        return typeof key === 'string' && key in this.baseUrls ? this.baseUrls[key as ApiBaseUrlKey] : this.baseUrls.default;
    }

    private getOrCreateInstance(key: ApiBaseUrlKey | string): AxiosInstance {
        const baseURL = this.getBaseUrl(key);
        if (!this.instances.has(key)) {
            // Check if this is a localhost URL in development mode
            const _isLocalhost =
                baseURL &&
                (baseURL.includes('localhost') ||
                    baseURL.includes('127.0.0.1') ||
                    baseURL.includes('://192.168.') ||
                    baseURL.startsWith('https://local'));

            // Create config with optional SSL bypass for localhost in development
            const config: AxiosRequestConfig = {
                baseURL,
                timeout: 180000,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*'
                }
            };

            // Add SSL bypass for server-side API requests (e.g. custom HTTPS ports like :21524)
            if (typeof window === 'undefined') {
                // biome-ignore lint/style/useNodejsImportProtocol: <explanation>
                const https = require('https');
                config.httpsAgent = new https.Agent({
                    keepAlive: true,
                    keepAliveMsecs: 60000,
                    maxSockets: 50,
                    maxFreeSockets: 10,
                    timeout: 60000,
                    rejectUnauthorized: false // Bypass SSL certificate validation for internal backend ports
                });
            }

            const instance = axios.create(config);

            this.setupInterceptors(instance);
            this.instances.set(key, instance);
        } else {
            const existing = this.instances.get(key);
            if (existing && baseURL && existing.defaults.baseURL !== baseURL) {
                existing.defaults.baseURL = baseURL;
            }
        }

        return this.instances.get(key)!;
    }

    private setupInterceptors(instance: AxiosInstance): void {
        // Request Interceptor
        instance.interceptors.request.use(
            async (config) => {
                try {
                    let token: string | undefined;

                    if (typeof window !== 'undefined') {
                        // Client-side: use getSession from next-auth/react
                        const { getSession, signOut } = await import('next-auth/react');
                        const session = await getSession();

                        // Check if the session is expired pre-emptively
                        // @ts-ignore
                        if (session?.expires_at) {
                            const currentTimestamp = Math.round(Date.now() / 1000);
                            // @ts-ignore
                            if (currentTimestamp >= session.expires_at) {
                                const Swal = (await import('sweetalert2')).default;
                                await signOut({ redirect: false });
                                sessionStorage.removeItem('isLoggedIn'); // Prevent double Swal on the sign-in page
                                await Swal.fire('Your Session has been Expired.....Please Re-login');
                                window.location.href = '/sign-in';
                                return Promise.reject(new Error('Session Expired'));
                            }
                        }

                        token = session?.token;
                    } else {
                        // Server-side: use auth from @/lib/auth
                        const { auth } = await import('@/lib/auth');
                        const session = await auth();
                        token = session?.token;
                    }

                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                } catch (error) {
                    console.error('Error in request interceptor:', error);
                    return config;
                }
            },
            (error) => Promise.reject(this.handleError(error))
        );

        // Response Interceptor
        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    try {
                        if (typeof window !== 'undefined') {
                            const { signOut } = await import('next-auth/react');
                            const Swal = (await import('sweetalert2')).default;
                            await signOut({ redirect: false });
                            sessionStorage.removeItem('isLoggedIn'); // Prevent double Swal on the sign-in page
                            await Swal.fire('Your Session has been Expired.....Please Re-login');
                            window.location.href = '/sign-in';
                        }
                    } catch (refreshError) {
                        console.error('Error handling session expiration:', refreshError);
                    }
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    // ... rest of the class remains the same
    private handleError(error: any): string {
        // Check for SSL certificate errors
        if (
            error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
            error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
            error.message?.includes('self-signed certificate')
        ) {
            console.error('🔴 SSL Certificate Error detected');
            console.error('🔴 If this is a local development server, ensure SSL bypass is enabled');
            console.error('🔴 For production, use valid SSL certificates');

            // Return a more helpful error message
            return (
                // biome-ignore lint/style/useTemplate: <explanation>
                `SSL Certificate Error: ${error.message}. ` +
                'For local development, make sure the ApiService is configured to bypass SSL validation.'
            );
        }

        // Format detailed validation errors from dotnet if present
        if (error?.response?.data?.errors) {
            const validationErrors = Object.entries(error.response.data.errors)
                .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
                .join(' | ');
            if (validationErrors) {
                return `Validation Error: ${validationErrors}`;
            }
        }

        if (error?.response?.data && typeof error.response.data === 'object') {
            if (error.response.data.message && typeof error.response.data.message === 'string') {
                return error.response.data.message;
            }
            const dataStr = JSON.stringify(error.response.data);
            if (dataStr && dataStr !== '{}' && dataStr.length < 300) {
                return `API Error: ${dataStr}`;
            }
        }

        if (typeof error === 'string') {
            return error;
        }

        return error?.response?.data?.message || error?.message || 'An unknown error occurred.';
    }

    public async request<T>(
        baseUrlKey: ApiBaseUrlKey,
        method: string,
        url: string,
        config?: AxiosRequestConfig,
        data?: unknown
    ): Promise<ApiResponse<T>> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);
            const baseURL = instance.defaults.baseURL;
            const fullUrl = `${baseURL}${url}`;

            console.info('🌐 [API SERVICE] Request initiated');
            console.info('📤 [API SERVICE] Request details:', {
                method,
                baseUrlKey,
                baseURL: baseURL || 'NOT SET - Check environment variable',
                url,
                fullUrl,
                hasData: !!data,
                dataSize: data ? JSON.stringify(data).length : 0,
                sslBypass: config?.httpsAgent ? 'Enabled' : 'Disabled'
            });

            // Warn if base URL is not set
            if (!baseURL && baseUrlKey === 'hmslms') {
                console.warn('⚠️ [API SERVICE] WARNING: hmslms base URL is not set!');
                console.warn('⚠️ [API SERVICE] Check NEXT_PUBLIC_HRMS_LMS_BASE_URL environment variable');
            }

            if (data && method === 'POST') {
                console.info('📦 [API SERVICE] Request payload:', JSON.stringify(data, null, 2));
            }

            const startTime = Date.now();
            const response = await instance.request<ApiResponse<T>>({
                method,
                url,
                data,
                ...config
            });
            const duration = Date.now() - startTime;

            console.info('✅ [API SERVICE] Response received');
            console.info('📥 [API SERVICE] Response details:', {
                status: response.status,
                statusText: response.statusText,
                duration: `${duration}ms`,
                hasData: !!response.data,
                success: response.data?.success,
                message: response.data?.message
            });

            if (response.data) {
                console.info('📊 [API SERVICE] Response data structure:', {
                    hasSuccess: 'success' in response.data,
                    hasMessage: 'message' in response.data,
                    hasData: 'data' in response.data,
                    keys: Object.keys(response.data || {})
                });
            }

            return response.data;
        } catch (error: any) {
            console.warn('❌ [API SERVICE] Request failed');
            console.warn('💥 [API SERVICE] Error details:', {
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                url: error?.config?.url,
                method: error?.config?.method,
                stack: error?.stack,
                rawError: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
            throw this.handleError(error);
        }
    }

    public async get<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'GET', url, config, undefined);
    }

    public async getArray<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T[]>> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);
            const response = await instance.request<ApiArrayResponse<T>>({
                method: 'GET',
                url,
                ...config
            });

            // Transform the response to extract $values and maintain the same structure
            const transformedResponse: ApiResponse<T[]> = {
                success: response.data.success,
                message: response.data.message,
                data: response.data.data?.$values ?? (Array.isArray(response.data.data) ? response.data.data : null),
                total: response.data.total,
                page: response.data.page,
                page_Size: response.data.page_Size
            };

            return transformedResponse;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async post<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'POST', url, config, data);
    }

    public async postBinary(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<any> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);
            const response = await instance.request({
                method: 'POST',
                url,
                data,
                responseType: 'arraybuffer',
                ...config
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public async put<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'PUT', url, config, data);
    }

    public async patch<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'PATCH', url, config, data);
    }

    public async delete<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>(baseUrlKey, 'DELETE', url, config, undefined);
    }

    public setBaseUrl(baseUrl: string, key: ApiBaseUrlKey = 'default'): void {
        const instance = this.getOrCreateInstance(key);
        instance.defaults.baseURL = baseUrl;
    }

    // Helper method to add custom base URLs at runtime
    public addBaseUrl(key: string, baseUrl: string): void {
        this.baseUrls[key as ApiBaseUrlKey] = baseUrl;
    }

    public async postMultipart<T>(
        baseUrlKey: ApiBaseUrlKey,
        url: string,
        formData: FormData,
        config?: AxiosRequestConfig
    ): Promise<ApiResponse<T>> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);

            // Override Content-Type so axios sets it properly for FormData
            const finalConfig: AxiosRequestConfig = {
                ...config,
                headers: {
                    ...(config?.headers || {}),
                    'Content-Type': undefined // Let axios auto-set boundary
                }
            };

            const response = await instance.post<ApiResponse<T>>(url, formData, finalConfig);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
}

// Create a singleton instance
/**
 * Creates a new instance of the ApiService class supporting multiple base URLs.
 * @returns An instance of the ApiService class with support for multiple API base URLs.
 * Methods available on the instance are:
 * - request<T>(baseUrlKey: ApiBaseUrlKey, method: string, url: string, config?: AxiosRequestConfig, data?: unknown): Promise<ApiResponse<T>>
 * - get<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * - getArray<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T[]>>
 * - post<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * - put<T>(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 * - delete<T>(baseUrlKey: ApiBaseUrlKey, url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>
 *
 * Usage examples:
 * - api.get('default', '/users')
 * - api.get('preadmission', '/applications')
 * - api.post('admission', '/students', data)
 */
export const api = new ApiService();

/**
 * Generates a URL string from the provided searchParams object.
 * @param searchParams - The searchParams object to generate the URL from.
 * @returns A string representing the URL.
 */
// export function getSearchParamsUrl(searchParams: ApiSearchparams | undefined, searchColumns?: string): string {
//     if (!searchParams) return '';

//     const page = searchParams?.page || 1;
//     const page_size = searchParams?.page_size || 10;
//     const sort_column = searchParams?.sort_column || '';
//     const sort_direction = searchParams?.sort_direction || 'asc';
//     const search_query = searchParams?.search_query || '';
//     const search_columns = searchParams?.search_columns || '';

//     if (!search_query) {
//         return `page=${page}&page_size=${page_size}&sort_column=${sort_column}&sort_direction=${sort_direction}`;
//     }

//     return `page=${page}&page_size=${page_size}&sort_column=${sort_column}&sort_direction=${sort_direction}&search_query=${search_query}&search_column=${searchColumns}`;
// }

export function getSearchParamsUrl(searchParams: ApiSearchparams | undefined, searchColumns?: string): string {
    if (!searchParams) return '';

    const page = searchParams?.page || 1;
    const page_size = searchParams?.page_size || 10;
    const sort_column = searchParams?.sort_column || '';
    const sort_direction = searchParams?.sort_direction || 'asc';
    const search_query = searchParams?.search_query || '';
    const search_columns = searchParams?.search_columns || '';

    let url = `page=${page}&page_size=${page_size}&sort_column=${sort_column}&sort_direction=${sort_direction}`;

    if (search_query) {
        url += `&search_query=${encodeURIComponent(search_query)}`;
        if (searchColumns) {
            url += `&search_column=${encodeURIComponent(searchColumns)}`;
        } else if (search_columns && search_columns !== '') {
            url += `&search_column=${encodeURIComponent(search_columns)}`;
        }
    }

    // Add any other arbitrary parameters from searchParams
    const handledKeys = ['page', 'page_size', 'sort_column', 'sort_direction', 'search_query', 'search_columns', 'search_column'];
    for (const key in searchParams) {
        if (!handledKeys.includes(key) && searchParams[key] !== undefined && searchParams[key] !== null) {
            url += `&${key}=${encodeURIComponent(String(searchParams[key]))}`;
        }
    }

    return url;
}
