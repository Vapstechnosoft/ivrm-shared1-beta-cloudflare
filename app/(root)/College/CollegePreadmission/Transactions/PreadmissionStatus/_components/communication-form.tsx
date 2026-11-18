'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const commSchema = z.object({
    email: z.boolean().default(false),
    sms: z.boolean().default(false),
    default: z.boolean().default(false),
    MailSubject: z.string().optional(),
    MailHeader: z.string().optional(),
    Parameter_email: z.string().optional(),
    MailFooter: z.string().optional(),
    smscontent: z.string().optional(),
});

export type CommunicationFormValues = z.infer<typeof commSchema>;

interface CommunicationFormProps {
    onChange: (values: CommunicationFormValues) => void;
}

export default function CommunicationForm({ onChange }: CommunicationFormProps) {
    const form = useForm<CommunicationFormValues>({
        resolver: zodResolver(commSchema),
        defaultValues: {
            email: false,
            sms: false,
            default: false,
        },
    });

    const emailEnabled = form.watch('email');
    const smsEnabled = form.watch('sms');

    const handleChange = () => {
        onChange(form.getValues());
    };

    return (
        <Form {...form}>
            <div className="space-y-4">
                {/* Communication Type Checkboxes */}
                <div className="flex gap-6 flex-wrap">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            handleChange();
                                        }}
                                    />
                                </FormControl>
                                <Label className="font-medium cursor-pointer">Email</Label>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sms"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            handleChange();
                                        }}
                                    />
                                </FormControl>
                                <Label className="font-medium cursor-pointer">SMS</Label>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="default"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            handleChange();
                                        }}
                                    />
                                </FormControl>
                                <Label className="font-medium cursor-pointer">Default</Label>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Email Fields */}
                {emailEnabled && (
                    <div className="border rounded-md p-4 space-y-3 bg-muted/30">
                        <h4 className="font-medium text-sm">Email Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="MailSubject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Email subject" onBlur={handleChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="MailHeader"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Header</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Email header" onBlur={handleChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="Parameter_email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message Body <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Email message body..."
                                            rows={4}
                                            onBlur={handleChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="MailFooter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Footer</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Email footer" onBlur={handleChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                {/* SMS Fields */}
                {smsEnabled && (
                    <div className="border rounded-md p-4 space-y-3 bg-muted/30">
                        <h4 className="font-medium text-sm">SMS Details</h4>
                        <FormField
                            control={form.control}
                            name="smscontent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SMS Content <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="SMS message content..."
                                            rows={3}
                                            onBlur={handleChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </div>
        </Form>
    );
}
