import {
    addBurnpurStudentApplication,
    getBurnpurActivePreadmissionDetails,
    getBurnpurCasteDropdown,
    getBurnpurCountryDropdown,
    getBurnpurDocumentDropdown,
    getBurnpurGenderDropdown,
    getBurnpurPreadmissionClassDropdown,
    getBurnpurReligionDropdown,
    getBurnpurStateDropdown,
    getBurnpurStudentApplicationList,
    initiateBurnpurApplicationPayment,
    updateBurnpurPaymentStatus
} from '@/server/admission/preadmission/transactions/brs_student_application';
import type { ApiSearchparams } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useBurnpurActivePreadmissionDetails = () => {
    return useQuery({
        queryKey: ['burnpur-active-preadmission-details'],
        queryFn: () => getBurnpurActivePreadmissionDetails()
    });
};

export const useBurnpurDropdowns = (religionId?: number, countryId?: number) => {
    const religion = useQuery({
        queryKey: ['burnpur-religion-dropdown'],
        queryFn: () => getBurnpurReligionDropdown()
    });

    const caste = useQuery({
        queryKey: ['burnpur-caste-dropdown', religionId],
        queryFn: () => getBurnpurCasteDropdown(religionId!),
        enabled: !!religionId
    });

    const country = useQuery({
        queryKey: ['burnpur-country-dropdown'],
        queryFn: () => getBurnpurCountryDropdown()
    });

    const state = useQuery({
        queryKey: ['burnpur-state-dropdown', countryId],
        queryFn: () => getBurnpurStateDropdown(countryId!),
        enabled: !!countryId
    });

    const gender = useQuery({
        queryKey: ['burnpur-gender-dropdown'],
        queryFn: () => getBurnpurGenderDropdown()
    });

    const classes = useQuery({
        queryKey: ['burnpur-class-dropdown'],
        queryFn: () => getBurnpurPreadmissionClassDropdown()
    });

    const documents = useQuery({
        queryKey: ['burnpur-document-dropdown'],
        queryFn: () => getBurnpurDocumentDropdown()
    });

    return { religion, caste, country, state, gender, classes, documents };
};

export const useBurnpurStudentApplicationList = (asmay_id: number, searchParams?: ApiSearchparams) => {
    return useQuery({
        queryKey: ['burnpur-student-application-list', asmay_id, searchParams],
        queryFn: () => getBurnpurStudentApplicationList(asmay_id, searchParams),
        enabled: !!asmay_id
    });
};

export const useAddBurnpurStudentApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => addBurnpurStudentApplication(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['burnpur-student-application-list'] });
        }
    });
};

export const useInitiateBurnpurPayment = () => {
    return useMutation({
        mutationFn: (pasr_id: number) => initiateBurnpurApplicationPayment(pasr_id)
    });
};

export const useUpdateBurnpurPaymentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { status: string; transaction_id: string; pasr_id: number }) =>
            updateBurnpurPaymentStatus(data.status, data.transaction_id, data.pasr_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['burnpur-student-application-list'] });
        }
    });
};
