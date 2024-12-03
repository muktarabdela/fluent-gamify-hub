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

const quickLessonSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    introduction: z.string().min(1, 'Introduction is required'),
    grammar_focus: z.string().optional(),
    vocabulary_words: z.string().optional(),
    vocabulary_phrases: z.string().optional(),
    key_points: z.string().optional(),
    example_sentences: z.string().optional(),
    image_url: z.string().url().optional().or(z.literal('')),
});

const QuickLessonForm = ({ initialData, onSubmit, onCancel }) => {
    const form = useForm({
        resolver: zodResolver(quickLessonSchema),
        defaultValues: {
            title: initialData?.title || '',
            introduction: initialData?.introduction || '',
            grammar_focus: initialData?.grammar_focus ? JSON.stringify(initialData.grammar_focus) : '',
            vocabulary_words: initialData?.vocabulary_words ? JSON.stringify(initialData.vocabulary_words) : '',
            vocabulary_phrases: initialData?.vocabulary_phrases ? JSON.stringify(initialData.vocabulary_phrases) : '',
            key_points: initialData?.key_points ? JSON.stringify(initialData.key_points) : '',
            example_sentences: initialData?.example_sentences ? JSON.stringify(initialData.example_sentences) : '',
            image_url: initialData?.image_url || '',
        },
    });

    const handleSubmit = (data) => {
        const parseJsonField = (field) => {
            try {
                return field ? JSON.parse(field) : [];
            } catch (error) {
                return [];
            }
        };

        onSubmit({
            ...data,
            grammar_focus: parseJsonField(data.grammar_focus),
            vocabulary_words: parseJsonField(data.vocabulary_words),
            vocabulary_phrases: parseJsonField(data.vocabulary_phrases),
            key_points: parseJsonField(data.key_points),
            example_sentences: parseJsonField(data.example_sentences),
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
                                <Input {...field} placeholder="Enter quick lesson title" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="introduction"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Introduction</FormLabel>
                            <FormControl>
                                <Textarea 
                                    {...field} 
                                    placeholder="Enter lesson introduction"
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

                    <FormField
                        control={form.control}
                        name="vocabulary_words"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vocabulary Words (JSON)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='["word1", "word2"]' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="vocabulary_phrases"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vocabulary Phrases (JSON)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='["phrase1", "phrase2"]' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="key_points"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Key Points (JSON)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='["point1", "point2"]' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="example_sentences"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Example Sentences (JSON)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder='["sentence1", "sentence2"]' />
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

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Update' : 'Create'} Quick Lesson
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default QuickLessonForm; 