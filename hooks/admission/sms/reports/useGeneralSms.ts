
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Replace the endpoint / client with your own API layer (axios instance, server action, etc.)
async function sendGeneralSms(payload: IGeneralSmsPayload): Promise<IGeneralSmsResponse> {
    const body = new FormData();
    body.append('sendSms', String(payload.sendSms));
    body.append('sendWhatsApp', String(payload.sendWhatsApp));
    body.append('message', payload.message);
    payload.mobileNumbers.forEach((n) => body.append('mobileNumbers', n));
    if (payload.contactsFile) body.append('contactsFile', payload.contactsFile);
    if (payload.whatsAppAttachment) body.append('whatsAppAttachment', payload.whatsAppAttachment);

    const res = await fetch('/api/communication/general-sms', { method: 'POST', body });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
}

export function useSendGeneralSms() {
    return useMutation({
        mutationFn: sendGeneralSms,
        onSuccess: (data) => toast.success(data.message || 'Message sent successfully'),
        onError: (err: Error) => toast.error(err.message)
    });
}

async function sendGeneralEmail(payload: any): Promise<IGeneralSmsResponse> {
    const body = new FormData();
    payload.emails.forEach((e:any) => body.append('emails', e));
    body.append('subject', payload.subject);
    body.append('header', payload.header);
    body.append('body', payload.body);
    body.append('footer', payload.footer ?? '');
    body.append('footerDetails', payload.footerDetails ?? '');
    if (payload.contactsFile) body.append('contactsFile', payload.contactsFile);
    if (payload.attachment) body.append('attachment', payload.attachment);

    const res = await fetch('/api/communication/general-email', { method: 'POST', body });
    if (!res.ok) throw new Error('Failed to send email');
    return res.json();
}

export function useSendGeneralEmail() {
    return useMutation({
        mutationFn: sendGeneralEmail,
        onSuccess: (data) => toast.success(data.message || 'Email sent successfully'),
        onError: (err: Error) => toast.error(err.message)
    });
}

async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Request failed');
    return res.json();
}

export function useStudentClasses(asmayId: number) {
    return useQuery({
        queryKey: ['student-sms', 'classes', asmayId],
        queryFn: () => getJson<{ data: IClassOption[] }>(`/api/communication/classes?asmayId=${asmayId}`),
        enabled: asmayId > 0
    });
}

export function useStudentSections(asmayId: number, classId: number) {
    return useQuery({
        queryKey: ['student-sms', 'sections', asmayId, classId],
        queryFn: () =>
            getJson<{ data: ISectionOption[] }>(`/api/communication/sections?asmayId=${asmayId}&classId=${classId}`),
        enabled: asmayId > 0 && classId > 0
    });
}

export function useStudentList({ asmayId, classId, sectionId, studentType }: IStudentListParams) {
    return useQuery({
        queryKey: ['student-sms', 'students', asmayId, classId, sectionId, studentType],
        queryFn: () =>
            getJson<{ data: IStudentRow[] }>(
                `/api/communication/students?asmayId=${asmayId}&classId=${classId}&sectionId=${sectionId}&type=${studentType}`
            ),
        enabled: asmayId > 0 && classId > 0 && sectionId > 0
    });
}

export function useSendStudentMessage() {
    return useMutation({
        mutationFn: async (payload: IStudentMessagePayload) => {
            const res = await fetch('/api/communication/student-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to send message');
            return res.json() as Promise<{ success: boolean; message: string }>;
        },
        onSuccess: (data) => toast.success(data.message || 'Message sent successfully'),
        onError: (err: Error) => toast.error(err.message)
    });
}


export function useStaffDepartments() {
    return useQuery({
        queryKey: ['staff-sms', 'departments'],
        queryFn: () => getJson<{ data: IDepartmentOption[] }>('/api/communication/departments')
    });
}

export function useStaffDesignations(departmentIds: number[]) {
    return useQuery({
        queryKey: ['staff-sms', 'designations', departmentIds],
        queryFn: () =>
            getJson<{ data: IDesignationOption[] }>(
                `/api/communication/designations?departmentIds=${departmentIds.join(',')}`
            ),
        enabled: departmentIds.length > 0
    });
}

export function useStaffList({ departmentIds, designationIds }: IStaffListParams) {
    return useQuery({
        queryKey: ['staff-sms', 'staff', departmentIds, designationIds],
        queryFn: () =>
            getJson<{ data: IStaffRow[] }>(
                `/api/communication/staff?departmentIds=${departmentIds.join(',')}&designationIds=${designationIds.join(',')}`
            ),
        enabled: departmentIds.length > 0 && designationIds.length > 0
    });
}

export function useSendStaffMessage() {
    return useMutation({
        mutationFn: async (payload: IStaffMessagePayload) => {
            const res = await fetch('/api/communication/staff-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to send message');
            return res.json() as Promise<{ success: boolean; message: string }>;
        },
        onSuccess: (data) => toast.success(data.message || 'Message sent successfully'),
        onError: (err: Error) => toast.error(err.message)
    });
}


export type SendMode = 'general-sms' | 'general-email' | 'student' | 'staff';

export interface IGeneralSmsPayload {
    sendSms: boolean;
    sendWhatsApp: boolean;
    mobileNumbers: string[];
    message: string;
    whatsAppAttachment?: File | null;
    contactsFile?: File | null;
}

export interface IGeneralSmsResponse {
    success: boolean;
    message: string;
}


export type StudentType = 'new' | 'regular';
export type StudentMessageCategory = 'exam' | 'attendance' | 'transport' | 'template';

export interface IStudentRow {
    amsT_Id: number;
    studentName: string;
    admNo: string;
    mobileNo: string;
    emailId: string;
}

export interface IClassOption {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface ISectionOption {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IStudentListParams {
    asmayId: number;
    classId: number;
    sectionId: number;
    studentType: StudentType;
}

export interface IStudentMessagePayload extends IStudentListParams {
    studentIds: number[];
    message: string;
    category?: StudentMessageCategory | null;
}
export interface IDepartmentOption {
    hrmD_Id: number;
    hrmD_DepartmentName: string;
}

export interface IDesignationOption {
    hrmdeS_Id: number;
    hrmdeS_DesignationName: string;
}

export interface IStaffRow {
    hrmE_Id: number;
    staffName: string;
    mobileNo: string | null;
    emailId: string | null;
}

export interface IStaffListParams {
    departmentIds: number[];
    designationIds: number[];
}

export interface IStaffMessagePayload extends IStaffListParams {
    staffIds: number[];
    message: string;
}
