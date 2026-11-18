import { z } from 'zod';

export const invMasterCustomerSchema = z.object({
    invmC_Id: z.number().default(0),
    invmC_CustomerName: z
        .string()
        .min(1, 'Customer Name is required')
        .regex(/^[a-zA-Z\s]+$/, 'Customer Name must contain only alphabets and spaces'),
    invmC_CustomerContactPerson: z.string().min(1, 'Contact Person is required'),
    invmC_CustomerContactNo: z.coerce
        .string()
        .length(10, 'Contact Number must be exactly 10 digits')
        .regex(/^[0-9]+$/, 'Contact Number must be numeric'),
    invmC_CustomerAddress: z.string().min(1, 'Customer Address is required'),
    invmC_ActiveFlg: z.boolean().default(true)
});

export type InvMasterCustomerSchema = z.infer<typeof invMasterCustomerSchema>;
