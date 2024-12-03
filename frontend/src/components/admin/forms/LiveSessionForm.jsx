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

const liveSessionSchema = z.object({
    status: z.enum(['Scheduled', 'Ongoing', 'Completed', 'Cancelled']),
    start_time: z.string(),
    duration: z.string(),
    max_participants: z.number().min(1).max(10),
    telegram_chat_id: z.string().optional(),
    inviteLink: z.string().url().optional().or(z.literal('')),
});

const LiveSessionForm = ({ initialData, onSubmit, onCancel }) => {
    const form = useForm({
        resolver: zodResolver(liveSessionSchema),
        defaultValues: {
            status: initialData?.status || 'Scheduled',
            start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : '',
            duration: initialData?.duration || '',
            max_participants: initialData?.max_participants || 4,
            telegram_chat_id: initialData?.telegram_chat_id?.toString() || '',
            inviteLink: initialData?.inviteLink || '',
        },
    });

    const handleSubmit = (data) => {
        onSubmit({
            ...data,
            max_participants: Number(data.max_participants),
            telegram_chat_id: data.telegram_chat_id || null,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    type="datetime-local" 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g., 30 minutes" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="max_participants"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max Participants</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    type="number" 
                                    min="1"
                                    max="10"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                    name="inviteLink"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Invite Link</FormLabel>
                            <FormControl>
                                <Input {...field} type="url" placeholder="Enter telegram invite link" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        Update Session
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default LiveSessionForm; 