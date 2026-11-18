import {
    getStudentAddressBook2InitialData,
    getStudentAddressBook2Report,
    studentAddressBook2SectionChange,
    studentAddressBook2YearChange
} from '@/server/admission/oldsharehost/reports/student_address_book_2';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useStudentAddressBook2InitialData() {
    return useQuery({
        queryKey: ['studentAddressBook2InitialData'],
        queryFn: () => getStudentAddressBook2InitialData()
    });
}

export function useStudentAddressBook2YearChange() {
    return useMutation({
        mutationFn: (data: any) => studentAddressBook2YearChange(data)
    });
}

export function useStudentAddressBook2SectionChange() {
    return useMutation({
        mutationFn: (data: any) => studentAddressBook2SectionChange(data)
    });
}

export function useStudentAddressBook2Report() {
    return useMutation({
        mutationFn: (data: any) => getStudentAddressBook2Report(data)
    });
}
