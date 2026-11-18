import { server } from '@/server/admission/preadmission/transactions/sophia_registration_xi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useSophiaRegistrationXIInitialData = (orgId: number, instId: number) => {
    return useQuery({
        queryKey: ['sophiaRegistrationXIInitialData', orgId, instId],
        queryFn: () => server.getInitialData(orgId, instId)
    });
};

export const useSophiaRegistrationXICaste = () => {
    return useMutation({
        mutationFn: (imccId: number) => server.getCaste(imccId)
    });
};

export const useSophiaRegistrationXIClassChange = () => {
    return useMutation({
        mutationFn: (payload: { ASMCL_Id: number; ASMAY_Id: number }) => server.onClassChange(payload.ASMCL_Id, payload.ASMAY_Id)
    });
};

export const useSophiaRegistrationXIStreams = () => {
    return useMutation({
        mutationFn: (classId: number) => server.getStreams(classId)
    });
};

export const useSophiaRegistrationXISubjects = () => {
    return useMutation({
        mutationFn: (payload: { ASMAY_Id: number; ASMCL_Id: number; ASMST_Id: number }) =>
            server.getSubjects(payload.ASMAY_Id, payload.ASMCL_Id, payload.ASMST_Id)
    });
};

export const useSophiaRegistrationXIStates = () => {
    return useMutation({
        mutationFn: (countryId: number) => server.getStates(countryId)
    });
};

export const useSophiaRegistrationXIDistricts = () => {
    return useMutation({
        mutationFn: (stateId: number) => server.getDistricts(stateId)
    });
};

export const useSophiaRegistrationXISave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => server.saveRegistration(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sophiaRegistrationXIInitialData'] });
        }
    });
};

export const useSophiaRegistrationXIDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => server.deleteRegistration(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sophiaRegistrationXIInitialData'] });
        }
    });
};

export const useSophiaRegistrationXIToggleStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => server.toggleStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sophiaRegistrationXIInitialData'] });
        }
    });
};

export const useSophiaRegistrationXIEmployees = () => {
    return useMutation({
        mutationFn: () => server.getEmployees()
    });
};

export const useSophiaRegistrationXIRoutes = () => {
    return useMutation({
        mutationFn: (trmaId: number) => server.getRoutes(trmaId)
    });
};

export const useSophiaRegistrationXIRoutesLocation = () => {
    return useMutation({
        mutationFn: (trmrId: number) => server.getRoutesLocation(trmrId)
    });
};

export const useSophiaRegistrationXIEditHealthData = () => {
    return useMutation({
        mutationFn: (id: number) => server.getEditHealthData(id)
    });
};

export const useSophiaRegistrationXIStatesSubCasteFather = () => {
    return useMutation({
        mutationFn: (imcId: number) => server.getStatesSubCasteFather(imcId)
    });
};

export const useSophiaRegistrationXIApplicationHtml = () => {
    return useMutation({
        mutationFn: (payload: { ASMAY_Id: number; ASMCL_Id: number; ASMST_Id: number }) =>
            server.getApplicationHtml(payload.ASMAY_Id, payload.ASMCL_Id, payload.ASMST_Id)
    });
};

export const useSophiaRegistrationXIProspectusDetails = () => {
    return useMutation({
        mutationFn: (paspId: number) => server.getProspectusDetails(paspId)
    });
};

export const useSophiaRegistrationXIFillProspectus = () => {
    return useMutation({
        mutationFn: (paspId: number) => server.fillProspectus(paspId)
    });
};

export const useSophiaRegistrationXIDeleteHealthDetails = () => {
    return useMutation({
        mutationFn: (id: number) => server.deleteHealthDetails(id)
    });
};

export const useSophiaRegistrationXIPrintGetHealthData = () => {
    return useMutation({
        mutationFn: (asmclId: number) => server.printGetHealthData(asmclId)
    });
};

export const useSophiaRegistrationXIStudentData = () => {
    return useMutation({
        mutationFn: () => server.getStudentData()
    });
};

export const useSophiaRegistrationXICountOfStudents = () => {
    return useMutation({
        mutationFn: (asmayId: number) => server.getCountOfStudents(asmayId)
    });
};

export const useSophiaRegistrationXIPayNow = () => {
    return useMutation({
        mutationFn: (payload: any) => server.payNow(payload)
    });
};

export const useSophiaRegistrationXICountry = () => {
    return useMutation({
        mutationFn: () => server.getCountry()
    });
};

export const useSophiaRegistrationXISaveHealthCertificateDetail = () => {
    return useMutation({
        mutationFn: (payload: any) => server.saveHealthCertificateDetail(payload)
    });
};

export const useSophiaRegistrationXIClassOverUnderAge = () => {
    return useMutation({
        mutationFn: (payload: any) => server.classOverUnderAge(payload)
    });
};

export const useSophiaRegistrationXIStudentPrintData = () => {
    return useMutation({
        mutationFn: (payload: any) => server.getStudentPrintData(payload)
    });
};

export const useSophiaRegistrationXIClassMaxMinAge = () => {
    return useMutation({
        mutationFn: (payload: { ASMAY_Id: number; ASMCL_Id: number }) => server.onClassChangeMaxMinAge(payload)
    });
};
