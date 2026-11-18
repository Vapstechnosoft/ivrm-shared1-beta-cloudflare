'use client';

import { ADMISSION_QUERY_KEYS } from '@/constants/query-keys';
import {
    changeClassSrkvsAddressBook,
    changeSectionSrkvsAddressBook,
    changeYearSrkvsAddressBook,
    getSrkvsAddressBookLoadData,
    getSrkvsAddressBookReport
} from '@/server/admission/preadmission/reports/srkvs_student_address_book';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSrkvsAddressBookLoadData = () => {
    return useQuery({
        queryKey: [ADMISSION_QUERY_KEYS.REPORTS, 'srkvs_address_book', 'load_data'],
        queryFn: () => getSrkvsAddressBookLoadData()
    });
};

export const useChangeYearSrkvsAddressBook = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; flag: string }) => changeYearSrkvsAddressBook(data)
    });
};

export const useChangeClassSrkvsAddressBook = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; flag: string; ASMCL_Id: number }) => changeClassSrkvsAddressBook(data)
    });
};

export const useChangeSectionSrkvsAddressBook = () => {
    return useMutation({
        mutationFn: (data: { ASMAY_Id: number; flag: string; ASMCL_Id: number; ASMS_Id: number }) => changeSectionSrkvsAddressBook(data)
    });
};

export const useSrkvsAddressBookReport = () => {
    return useMutation({
        mutationFn: (data: any) => getSrkvsAddressBookReport(data)
    });
};
