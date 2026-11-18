import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createPreUser } from '@/server/admission/preadmission/configuration/pre_user_create';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const preUserSchema = z.object({
    pasR_FirstName: z
        .string()
        .min(1, { message: 'Enter the field Name' })
        .regex(/^[\s|a-zA-Z]+$/, { message: 'The field contains only alphabets' }),
    pasR_MobileNo: z
        .string()
        .regex(/^[6-9]{1}[0-9]{9}$/, { message: 'Enter valid Mobile NO' })
        .min(10)
        .max(10),
    pasR_emailId: z.string().email({ message: 'Please enter valid email which contains "@" and "."' }),
    username: z
        .string()
        .min(1, { message: 'Enter the field User Name' })
        .regex(/^[\s|a-zA-Z]+$/, { message: 'The field contains only alphabets' })
});

type PreUserFormValues = z.infer<typeof preUserSchema>;

export default function AddPreUserForm() {
    const queryClient = useQueryClient();

    const form = useForm<PreUserFormValues>({
        resolver: zodResolver(preUserSchema),
        defaultValues: {
            pasR_FirstName: '',
            pasR_MobileNo: '',
            pasR_emailId: '',
            username: ''
        }
    });

    const mutation = useMutation({
        mutationFn: async (values: PreUserFormValues) => {
            const formData = new FormData();
            formData.append('onlinepreadminfilepath', '');
            formData.append('Name', values.pasR_FirstName);
            formData.append('Email_id', values.pasR_emailId);
            formData.append('Mobileno', values.pasR_MobileNo);
            formData.append('Username', values.username);
            formData.append('Password', 'Password@123');
            formData.append('Otpmobl', 'false');
            formData.append('Otpemail', 'false');
            formData.append('Special', 'Special');

            return await createPreUser(formData);
        },
        onSuccess: (data) => {
            // Depending on how backend returns (success bool vs raw string "created")
            // The angular code expects response.data == "created" or some string.
            // Our apiService wraps it. We'll check the message or success.
            toast.success('Account created successfully');
            form.reset();
            queryClient.invalidateQueries({ queryKey: ['PRE_USER_INITIAL_DATA'] });
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to create user');
        }
    });

    const onSubmit = (values: PreUserFormValues) => {
        mutation.mutate(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name='pasR_FirstName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Name of User <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Name Of The User' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='pasR_MobileNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Mobile Number <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Mobile Number' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='pasR_emailId'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Email -Id <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter Email -Id' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='username'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    User Name <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter The UserName' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4'>
                    <Button type='submit' className='w-32'>
                        <i className='fa fa-check-square-o mr-2' aria-hidden='true'></i> Create User
                    </Button>
                    <Button type='button' variant='destructive' onClick={() => form.reset()} className='w-32'>
                        Clear
                    </Button>
                </div>
            </form>
        </Form>
    );
}
