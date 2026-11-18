import { type ApiResponse, api } from '@/lib/apiService';

export const server = {
    getInitialData: async (orgId: number, instId: number): Promise<ApiResponse<any>> => {
        try {
            return await api.post('preadmission', '/student_application_form/academicyear_dropdown', { Organization: orgId, Institute: instId });
        } catch {
            try {
                return await api.post('preadmission', '/student_application_form/country', { Organization: orgId, Institute: instId });
            } catch {
                return await api.post('preadmission', '/StudentApplication/getdpforreg', { Organization: orgId, Institute: instId });
            }
        }
    },

    getCaste: async (IMCC_Id: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/getCaste', { params: { IMCC_Id } });
    },

    onClassChange: async (ASMCL_Id: number, ASMAY_Id: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', '/student_application_form/classchange', { ASMCL_Id: ASMCL_Id, ASMAY_Id: ASMAY_Id });
    },

    onClassChangeMaxMinAge: async (payload: { ASMAY_Id: number; ASMCL_Id: number }): Promise<ApiResponse<any>> => {
        return api.post('preadmission', '/student_application_form/classchangemaxminage', payload);
    },

    getStreams: async (ASMCL_Id: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `/student_application_form/getstreams?ASMCL_Id=${ASMCL_Id}`, {});
    },

    getSubjects: async (ASMAY_Id: number, ASMCL_Id: number, ASMST_Id: number): Promise<ApiResponse<any>> => {
        return api.post(
            'preadmission',
            `/student_application_form/GetSubjectsofinstitute?ASMAY_Id=${ASMAY_Id}&ASMCL_Id=${ASMCL_Id}&ASMST_Id=${ASMST_Id}`,
            {}
        );
    },

    getStates: async (IVRMMC_Id: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/getdpstate', { params: { IVRMMC_Id } });
    },

    getDistricts: async (stateId: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/getdpdistrict', { params: { stateId } });
    },

    getEmployees: async (): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/getemployees');
    },

    getRoutes: async (TRMA_Id: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/getroutes', { params: { TRMA_Id } });
    },

    getRoutesLocation: async (TRMR_Id: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/getrouteslocation', { params: { TRMR_Id } });
    },

    getEditHealthData: async (id: number): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/getEdithelthData', { params: { PASHD_Id: id } });
    },

    getStatesSubCasteFather: async (IMC_ID: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `/student_application_form/getdpstatesubcatsefather?IMC_ID=${IMC_ID}`, {});
    },

    getApplicationHtml: async (ASMAY_Id: number, ASMCL_Id: number, ASMST_Id: number): Promise<ApiResponse<any>> => {
        return api.post(
            'preadmission',
            `/student_application_form/getapplicationhtml?ASMAY_Id=${ASMAY_Id}&ASMCL_Id=${ASMCL_Id}&ASMST_Id=${ASMST_Id}`,
            {}
        );
    },

    getProspectusDetails: async (PASP_Id: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `/student_application_form/getdprospectusdetails?PASP_Id=${PASP_Id}`, {});
    },

    deleteRegistration: async (PASR_Id: number): Promise<ApiResponse<any>> => {
        return api.delete('preadmission', '/student_application_form/deletedetails', { params: { PASR_Id } });
    },

    fillProspectus: async (PASP_Id: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `/student_application_form/fill_prospectus?PASP_Id=${PASP_Id}`, {});
    },

    toggleStatus: async (PASR_Id: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `/student_application_form/ActivateDactivate?PASR_Id=${PASR_Id}`, {});
    },

    deleteHealthDetails: async (PASHD_Id: number): Promise<ApiResponse<any>> => {
        return api.delete('preadmission', '/student_application_form/deletehelthdetails', { params: { PASHD_Id } });
    },

    printGetHealthData: async (ASMCL_ID: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `/student_application_form/printgethelthData?ASMCL_ID=${ASMCL_ID}`, {});
    },

    getStudentData: async (): Promise<ApiResponse<any>> => {
        return api.post('preadmission', '/student_application_form/getstudata', {});
    },

    getCountOfStudents: async (ASMAY_Id: number): Promise<ApiResponse<any>> => {
        return api.post('preadmission', `/student_application_form/Getcountofstudents?ASMAY_Id=${ASMAY_Id}`, {});
    },

    payNow: async (payload: any): Promise<ApiResponse<any>> => {
        return api.post('preadmission', '/student_application_form/paynow', payload);
    },

    getCountry: async (): Promise<ApiResponse<any>> => {
        return api.post('preadmission', '/student_application_form/country', {});
    },

    saveHealthCertificateDetail: async (payload: any): Promise<ApiResponse<any>> => {
        const pashdId = payload.PASHD_Id || payload.pashD_Id || 0;
        return api.post('preadmission', `/student_application_form/savehealthcertificatedetail?PASHD_Id=${pashdId}`, payload);
    },

    classOverUnderAge: async (payload: any): Promise<ApiResponse<any>> => {
        return api.get('preadmission', '/student_application_form/classoverunderage', { params: payload });
    },

    saveRegistration: async (payload: any): Promise<ApiResponse<any>> => {
        return api.post('preadmission', '/student_application_form/SavePreadmissiomRegistrartionDetails', payload);
    },

    getStudentPrintData: async (payload: any): Promise<ApiResponse<any>> => {
        return api.post('preadmission', '/student_application_form/getstudentprintData', payload);
    }
};
