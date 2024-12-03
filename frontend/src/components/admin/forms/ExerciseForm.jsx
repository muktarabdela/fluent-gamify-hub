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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const exerciseSchema = z.object({
    type: z.enum(['sentence_building', 'multiple_choice', 'shadowing', 'fill_blank']),
    question: z.string().min(1, 'Question is required'),
    correct_answer: z.string().min(1, 'Correct answer is required'),
    options: z.string().optional(),
    audio_url: z.string().url().optional().or(z.literal('')),
    image_url: z.string().url().optional().or(z.literal('')),
    order_number: z.number().min(1, 'Order number must be greater than 0'),
});

const ExerciseForm = ({ initialData, onSubmit, onCancel }) => {
    const form = useForm({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            type: initialData?.type || 'multiple_choice',
            question: initialData?.question || '',
            correct_answer: initialData?.correct_answer || '',
            options: initialData?.options ? JSON.stringify(initialData.options) : '',
            audio_url: initialData?.audio_url || '',
            image_url: initialData?.image_url || '',
            order_number: initialData?.order_number || 1,
        },
    });

    const exerciseType = form.watch('type');

    const handleSubmit = (data) => {
        onSubmit({
            ...data,
            order_number: Number(data.order_number),
            options: data.options ? JSON.parse(data.options) : [],
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exercise Type</FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select exercise type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                    <SelectItem value="sentence_building">Sentence Building</SelectItem>
                                    <SelectItem value="shadowing">Shadowing</SelectItem>
                                    <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                                <Textarea 
                                    {...field} 
                                    placeholder="Enter exercise question"
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="correct_answer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Correct Answer</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter correct answer" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {exerciseType === 'multiple_choice' && (
                    <FormField
                        control={form.control}
                        name="options"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Options (JSON Array)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='["option1", "option2", "option3"]' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="audio_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Audio URL</FormLabel>
                                <FormControl>
                                    <Input {...field} type="url" placeholder="Enter audio URL" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="image_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image URL</FormLabel>
                                <FormControl>
                                    <Input {...field} type="url" placeholder="Enter image URL" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="order_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Order Number</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    type="number" 
                                    min="1"
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
                        {initialData ? 'Update' : 'Create'} Exercise
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ExerciseForm; 