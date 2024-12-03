import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const telegramGroupSchema = z.object({
    telegram_chat_id: z.string().min(1, 'Telegram chat ID is required'),
    status: z.enum(['available', 'in_use', 'archived']).default('available'),
});

const TelegramGroupForm = ({ initialData, onSubmit, onCancel }) => {
    const form = useForm({
        resolver: zodResolver(telegramGroupSchema),
        defaultValues: {
            telegram_chat_id: initialData?.telegram_chat_id?.toString() || '',
            status: initialData?.status || 'available',
        },
    });

    const handleSubmit = (data) => {
        onSubmit({
            ...data,
            telegram_chat_id: data.telegram_chat_id
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="telegram_chat_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telegram Chat ID</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter telegram chat ID" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="in_use">In Use</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Update' : 'Create'} Group
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default TelegramGroupForm; 