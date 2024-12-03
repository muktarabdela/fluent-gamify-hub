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

const practiceExerciseSchema = z.object({
    type_id: z.number().min(1, 'Exercise type is required'),
    topic: z.string().min(1, 'Topic is required'),
    content: z.string().min(1, 'Content is required'),
});

const PracticeExerciseForm = ({ initialData, onSubmit, onCancel, categories, selectedCategory }) => {
    // Parse exercise types from JSON string if necessary
    let exerciseTypes = [];
    if (selectedCategory?.exerciseTypes) {
        try {
            exerciseTypes = JSON.parse(selectedCategory.exerciseTypes);
        } catch (error) {
            console.error('Failed to parse exercise types:', error);
        }
    }

    console.log('Selected Category:', selectedCategory);
    console.log('Categories:', categories);
    console.log('Exercise Types:', exerciseTypes);

    const form = useForm({
        resolver: zodResolver(practiceExerciseSchema),
        defaultValues: {
            type_id: initialData?.type_id || '',
            topic: initialData?.topic || '',
            content: initialData?.content ? JSON.stringify(initialData.content, null, 2) : '',
        },
    });

    const handleSubmit = (data) => {
        try {
            const parsedContent = JSON.parse(data.content);
            onSubmit({
                ...data,
                type_id: Number(data.type_id),
                content: parsedContent,
            });
        } catch (error) {
            form.setError('content', {
                type: 'manual',
                message: 'Invalid JSON format'
            });
        }
    };

    const getPlaceholderContent = (typeId) => {
        const placeholders = {
            // Flashcards
            1: {
                cards: [
                    {
                        word: "example",
                        definition: "a representative form or pattern",
                        imageUrl: "https://example.com/image.jpg",
                        audioUrl: "https://example.com/audio.mp3",
                        examples: [
                            "This is an example sentence.",
                            "Here's another example."
                        ],
                        translation: "例 (rei)"
                    }
                ]
            },
            // Word Pronunciation
            2: {
                words: [
                    {
                        word: "example",
                        phoneticSpelling: "ɪɡˈzæmpəl",
                        audioUrl: "https://example.com/pronunciation.mp3",
                        tips: "Focus on the stress in the second syllable",
                        commonErrors: ["ig-zample", "ex-ample"]
                    }
                ]
            },
            // Sentence Shadowing
            3: {
                sentences: [
                    {
                        text: "This is a sample sentence for shadowing practice.",
                        audioUrl: "https://example.com/audio.mp3",
                        speed: "normal", // or "slow"
                        translation: "これは影追いの練習のためのサンプル文です。"
                    }
                ]
            },
            // Video Stories
            4: {
                videoUrl: "https://example.com/video.mp4",
                title: "Daily Routine",
                transcript: "This is the video transcript...",
                questions: [
                    {
                        question: "What is the main topic of the video?",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                        correctAnswer: "Option A"
                    }
                ],
                timestamps: {
                    "0:00": "Introduction",
                    "1:30": "Main topic",
                    "3:00": "Conclusion"
                }
            },
            // Dictation Practice
            5: {
                audioUrl: "https://example.com/dictation.mp3",
                text: "This is the text that students need to transcribe.",
                hints: ["Listen for plural forms", "Pay attention to articles"],
                difficulty: "intermediate"
            },
            // Sentence Building
            6: {
                sentences: [
                    {
                        scrambledWords: ["the", "dog", "chases", "ball", "red"],
                        correctSentence: "The dog chases the red ball",
                        hint: "Start with the subject"
                    }
                ]
            },
            // Grammar Quizzes
            7: {
                questions: [
                    {
                        question: "Choose the correct form of the verb:",
                        sentence: "She ___ to school every day.",
                        options: ["go", "goes", "going", "went"],
                        correctAnswer: "goes",
                        explanation: "Use third person singular form (goes) with she/he/it"
                    }
                ],
                grammarPoint: "Present Simple - Third Person Singular",
                difficulty: "beginner"
            }
        };

        return JSON.stringify(placeholders[typeId] || {}, null, 2);
    };

    // Add this to track the selected exercise type
    const selectedTypeId = form.watch('type_id');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="type_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Exercise Type</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={field.value ? field.value.toString() : undefined}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select exercise type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {exerciseTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Topic Title</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter topic title" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content (JSON)</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder={getPlaceholderContent(selectedTypeId)}
                                    rows={15}
                                    className="font-mono text-sm"
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
                        {initialData ? 'Update' : 'Create'} Practice Exercise
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PracticeExerciseForm; 