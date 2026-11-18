'use server';

import { api } from '@/lib/apiService';

export async function getPreUserInitialData() {
    const url = '/RegistrationReport/Get_Intial_data';
    return await api.get<any>('preadmission', url);
}

export async function getPreUserDetails() {
    const url = `/RegistrationReport/Getdetailsforpre`;
    return await api.post<any>('preadmission', url);
}

export async function createPreUser(payload: any) {
    const url = '/RegistrationReport/Regis';
    return await api.post<any>('preadmission', url, payload);
}

export async function activateDeactivatePreUsers(users: any[], count: number) {
    const url = '/RegistrationReport/avtivedeactive';
    const payload = {
        count: count,
        data_array: users
    };
    return await api.post<any>('preadmission', url, payload);
}

export async function sendSmsToPreUsers(users: any[]) {
    const url = '/RegistrationReport/smssend';
    const payload = {
        data_array: users
    };
    return await api.post<any>('preadmission', url, payload);
}

export async function sendEmailToPreUsers(users: any[]) {
    const url = '/RegistrationReport/emailsend';
    const payload = {
        data_array: users
    };
    return await api.post<any>('preadmission', url, payload);
}
