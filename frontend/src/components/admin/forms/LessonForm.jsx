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

const lessonSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    order_number: z.number().min(1, 'Order number must be greater than 0'),
    grammar_focus: z.string().optional(),
    vocabulary_words: z.number().min(0).default(0),
    vocabulary_phrases: z.number().min(0).default(0),
    live_session_title: z.string().optional(),
    live_session_duration: z.string().optional(),
    live_session_max_participants: z.number().min(1).max(10).default(4),
});

const LessonForm = ({ initialData, onSubmit, onCancel }) => {
    const form = useForm({
        resolver: zodResolver(lessonSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            order_number: initialData?.order_number || 1,
            grammar_focus: initialData?.grammar_focus ? JSON.stringify(initialData.grammar_focus) : '',
            vocabulary_words: initialData?.vocabulary_words || 0,
            vocabulary_phrases: initialData?.vocabulary_phrases || 0,
            live_session_title: initialData?.live_session_title || '',
            live_session_duration: initialData?.live_session_duration || '',
            live_session_max_participants: initialData?.live_session_max_participants || 4,
        },
    });

    const handleSubmit = (data) => {
        onSubmit({
            ...data,
            order_number: Number(data.order_number),
            vocabulary_words: Number(data.vocabulary_words),
            vocabulary_phrases: Number(data.vocabulary_phrases),
            live_session_max_participants: Number(data.live_session_max_participants),
            grammar_focus: data.grammar_focus ? JSON.parse(data.grammar_focus) : null,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter lesson title" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea 
                                    {...field} 
                                    placeholder="Enter lesson description"
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
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

                    <FormField
                        control={form.control}
                        name="grammar_focus"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Grammar Focus (JSON)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='["point1", "point2"]' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="vocabulary_words"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vocabulary Words</FormLabel>
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

                    <FormField
                        control={form.control}
                        name="vocabulary_phrases"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vocabulary Phrases</FormLabel>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="live_session_title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Live Session Title</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter live session title" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="live_session_duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Live Session Duration</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g., 30 minutes" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="live_session_max_participants"
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

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Update' : 'Create'} Lesson
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default LessonForm; 