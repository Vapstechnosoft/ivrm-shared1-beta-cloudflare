import { auth, signOut } from '@/lib/auth';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export type ApiBaseUrlKey =
    | 'default'
    | 'preadmission'
    | 'admission'
    | 'college'
    | 'fees'
    | 'exam'
    | 'hrms'
    | 'hrmsfrontoffice'
    | 'hmslms'
    | 'timetable'
    | 'hrmsrecruitment'
    | 'signage'
    | 'collegepreadmission';

class ApiServiceNew {
    private instances: Map<string, AxiosInstance>;
    private baseUrls: Record<ApiBaseUrlKey, string>;

    constructor() {
        this.instances = new Map();

        this.baseUrls = {
            default: process.env.NEXT_PUBLIC_API_BASE_URL || '',
            preadmission: process.env.NEXT_PUBLIC_PREADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            admission: process.env.NEXT_PUBLIC_ADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',

            fees: process.env.NEXT_PUBLIC_FEES_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            exam: process.env.NEXT_PUBLIC_EXAM_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrms: process.env.NEXT_PUBLIC_HRMS_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrmsfrontoffice: process.env.NEXT_PUBLIC_HRMS_FRONTOFFICE_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hmslms: process.env.NEXT_PUBLIC_HRMS_LMS_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            timetable: process.env.NEXT_PUBLIC_TIMETABLE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            hrmsrecruitment: process.env.NEXT_PUBLIC_HRMS_RECRUITMENT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            signage: process.env.NEXT_PUBLIC_SIGNAGE_API_BASE_URL || process.env.SIGNAGE_API_BASE_URL || 'http://172.16.10.77:65501',
            college: process.env.NEXT_PUBLIC_COLLEGE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
            collegepreadmission: process.env.NEXT_PUBLIC_COLLEGEPREADMISSION_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '',
        };

        this.getOrCreateInstance('default');
    }

    private getOrCreateInstance(key: ApiBaseUrlKey | string): AxiosInstance {
        if (!this.instances.has(key)) {
            const baseURL = typeof key === 'string' && key in this.baseUrls ? this.baseUrls[key as ApiBaseUrlKey] : this.baseUrls.default;

            const instance = axios.create({
                baseURL,
                timeout: 180000,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: '*/*'
                }
            });

            this.setupInterceptors(instance, key);
            this.instances.set(key, instance);
        }

        return this.instances.get(key)!;
    }

    private setupInterceptors(instance: AxiosInstance, key: string): void {
        instance.interceptors.request.use(
            async (config) => {
                if (key === 'signage') return config;

                try {
                    const session = await auth();
                    if (session?.token) {
                        config.headers.Authorization = `Bearer ${session.token}`;
                    }
                    return config;
                } catch (error) {
                    console.error('Error in request interceptor:', error);
                    return config;
                }
            },
            (error) => Promise.reject(this.handleError(error))
        );

        instance.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401 && key !== 'signage') {
                    try {
                        await signOut();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/sign-in';
                        }
                    } catch (refreshError) {
                        console.error('Error refreshing session:', refreshError);
                    }
                }
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private handleError(error: any): string {
        return error || 'An unknown error occurred.';
    }

    public async request(
        baseUrlKey: ApiBaseUrlKey,
        method: string,
        url: string,
        config?: AxiosRequestConfig,
        data?: unknown
    ): Promise<any> {
        try {
            const instance = this.getOrCreateInstance(baseUrlKey);

            const response = await instance.request({
                method,
                url,
                data,
                ...config
            });

            return response.data;
        } catch (error: any) {
            throw this.handleError(error);
        }
    }

    public async post(baseUrlKey: ApiBaseUrlKey, url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.request(baseUrlKey, 'POST', url, config, data);
    }

    public setBaseUrl(baseUrl: string, key: ApiBaseUrlKey = 'default'): void {
        const instance = this.getOrCreateInstance(key);
        instance.defaults.baseURL = baseUrl;
    }

    public addBaseUrl(key: string, baseUrl: string): void {
        this.baseUrls[key as ApiBaseUrlKey] = baseUrl;
    }

    public getBaseUrl(key: ApiBaseUrlKey): string {
        return this.baseUrls[key] || '';
    }
}

export const api_new = new ApiServiceNew();
