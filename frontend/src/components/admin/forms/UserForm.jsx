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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const userSchema = z.object({
    country: z.string().min(1, 'Country is required'),
    interests: z.string().optional(),
    onboarding_completed: z.boolean().default(false),
    like_coins_increment: z.number().min(0).default(0),
});

const UserForm = ({ initialData, onSubmit, onCancel }) => {
    const form = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            country: initialData?.country || '',
            interests: initialData?.interests ? JSON.stringify(initialData.interests) : '',
            onboarding_completed: initialData?.onboarding_completed || false,
            like_coins_increment: 0,
        },
    });

    const handleSubmit = (data) => {
        try {
            onSubmit({
                ...data,
                interests: data.interests ? JSON.parse(data.interests) : [],
                like_coins_increment: Number(data.like_coins_increment),
            });
        } catch (error) {
            form.setError('interests', {
                type: 'manual',
                message: 'Invalid JSON format'
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter country" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Interests (JSON Array)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder='["interest1", "interest2"]' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="onboarding_completed"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                            <FormLabel>Onboarding Completed</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="like_coins_increment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Add Like Coins</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    type="number" 
                                    min="0"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
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
                        Update User
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default UserForm; 