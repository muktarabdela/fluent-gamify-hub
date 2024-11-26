import React, { useEffect, useState, useRef } from 'react';
import { Lock, Unlock, Headphones, BookOpen, Video, Mic, Users, CheckCircle, Coins, ChevronRight } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import LessonActionButton from './StartLearningButton';
import { getAllUnits } from '@/api/unitService';
import { getLessonsByUnit } from '@/api/lessonService';
import { Skeleton } from "@/components/ui/skeleton";
const practiceIcons = {
    "Shadowing": <Mic size={14} />,
    "Flashcards": <BookOpen size={14} />,
    "Video Questions": <Video size={14} />,
    "Vocabulary Practice": <BookOpen size={14} />,
    "Listening Activity": <Headphones size={14} />,
    "Listening Practice": <Headphones size={14} />,
};

const parseJSON = (jsonData) => {
    if (Array.isArray(jsonData)) {
        return jsonData;
    }

    if (typeof jsonData === 'string') {
        try {
            return JSON.parse(jsonData);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            return [];
        }
    }

    return [];
};

function LessonCard({ lesson }) {
    const [imageError, setImageError] = useState(false);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
                return 'border-l-4 border-l-green-500 bg-green-50';
            case 'active':
                return 'border-l-4 border-l-blue-500 bg-blue-50';
            default:
                return 'border-l-4 border-l-gray-300 bg-gray-150';
        }
    };

    const getInitials = (title) => {
        return title
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AccordionItem
            value={`item-${lesson.lesson_id}`}
            className={`mb-4 mt-10 rounded-lg overflow-hidden shadow-md transition-all duration-300 ${getStatusStyles(lesson.status)}`}
        >
            <AccordionTrigger className="hover:no-underline px-2 py-4 [&>svg]:hidden group">
                <div className="flex items-center justify-between w-full rounded-lg transition-all duration-200 group-hover:bggray-50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={`https://tools-api.webcrumbs.org/image-placeholder/48/48/${lesson.topic}/1`}
                                alt={lesson.title}
                                className="w-14 h-14 rounded-xl object-cover shadow-sm"
                            />
                            {lesson.status === 'completed' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle size={12} className="text-white" />
                                </div>
                            )}
                            {(!lesson.status || lesson.status === 'locked') && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                                    <Lock size={12} className="text-white" />
                                </div>
                            )}
                            {lesson.status === 'active' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <ChevronRight size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex text-end gap-3 mb-1">
                                <h4 className="text-lg font-semibold text-start whitespace-nowrap text-gray-800 group-hover:text-primary transition-colors">
                                    {lesson.title}
                                </h4>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 text-start">{lesson.description}</p>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent>
                <div className="px-4 py-3 space-y-4">
                    <p className="text-sm text-gray-600">{lesson.description}</p>

                    {lesson.grammar_focus && (
                        <div className="border-t pt-3">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Grammar Focus:</h3>
                            <div className="flex flex-wrap gap-2">
                                {parseJSON(lesson.grammar_focus).map((point, index) => (
                                    <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                        <span className="ml-1 text-xs">{point}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Vocabulary:</h3>
                        <div className="flex space-x-4">
                            <Badge variant="outline">{lesson.vocabulary_words} words</Badge>
                            <Badge variant="outline">{lesson.vocabulary_phrases} phrases</Badge>
                        </div>
                    </div>

                    {lesson.practices && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Interactive Practices:</h3>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {lesson.practices.map((practice, index) => (
                                    <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                        {practiceIcons[practice]}
                                        <span className="ml-1 text-xs">{practice}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {lesson.live_session_title && (
                        <div className="bg-yellow-100 rounded-md p-3">
                            <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                                <Users size={16} className="mr-2" />
                                Live Group Session
                            </h3>
                            <p className="text-sm text-yellow-800 mb-1">{lesson.live_session_title}</p>
                            <div className="flex justify-between text-xs text-yellow-700">
                                <span>Max {lesson.live_session_max_participants} participants</span>
                                <span>{lesson.live_session_duration}</span>
                            </div>
                        </div>
                    )}

                    <LessonActionButton
                        status={lesson.status || 'locked'}
                        lessonId={lesson.lesson_id}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

// Add this new component for the skeleton loading
const LessonCardSkeleton = () => {
    return (
        <div className="mb-4 mt-10">
            <div className="px-2 py-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Skeleton className="w-14 h-14 rounded-xl" />
                            <Skeleton className="absolute -top-1 -right-1 w-5 h-5 rounded-full" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-[200px]" />
                            <Skeleton className="h-4 w-[300px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function MobileLessonDashboard() {
    const [units, setUnits] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleUnit, setVisibleUnit] = useState(null);
    const userId = 2;
    const lessonRefs = useRef({});
    const unitDividerRefs = useRef({});

    // Fetch all units first
    useEffect(() => {
        const fetchAllUnits = async () => {
            try {
                const unitsData = await getAllUnits();
                setUnits(unitsData);
                // Set the first unit as visible by default
                if (unitsData.length > 0) {
                    setVisibleUnit(unitsData[0].unit_id);
                }
                // Load lessons for all units
                await Promise.all(unitsData.map(unit => fetchLessonsForUnit(unit.unit_id)));
            } catch (err) {
                console.error('Error fetching units:', err);
                setError(err.message);
            }
        };
        fetchAllUnits();
    }, []);

    const fetchLessonsForUnit = async (unitId) => {
        try {
            setLoading(true);
            const lessonsData = await getLessonsByUnit(unitId, userId);
            setLessons(prev => [...prev, ...lessonsData]);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching lessons:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const unitId = parseInt(entry.target.getAttribute('data-unit-id'));
                const previousUnitId = units[units.findIndex(u => u.unit_id === unitId) - 1]?.unit_id;

                if (entry.isIntersecting) {
                    setVisibleUnit(unitId);
                } else {
                    const rect = entry.target.getBoundingClientRect();
                    if (rect.top > 0) {
                        setVisibleUnit(previousUnitId);
                    }
                }
            });
        }, options);

        // Only observe dividers for units after the first one
        Object.values(unitDividerRefs.current).forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [units]);

    // Group lessons by unit
    const lessonsByUnit = lessons.reduce((acc, lesson) => {
        if (!acc[lesson.unit_id]) {
            acc[lesson.unit_id] = [];
        }
        acc[lesson.unit_id].push(lesson);
        return acc;
    }, {});

    return (
        <div className="bg-gray-0">
            <div className="container mx-auto px-4">
                {loading ? (
                    // Show skeletons while loading
                    Array(3).fill(0).map((_, index) => (
                        <div key={`skeleton-${index}`} className="mb-8">
                            {/* Unit Header Skeleton */}
                            <div className="sticky top-[4.5rem] z-10 mb-4">
                                <section className="py-4 bg-white/95 backdrop-blur-md shadow-md px-6 max-w-md mx-auto rounded-xl">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[100px]" />
                                                <Skeleton className="h-6 w-[200px]" />
                                            </div>
                                            <Skeleton className="h-8 w-16 rounded-full" />
                                        </div>
                                        <Skeleton className="h-2 w-full rounded-full" />
                                    </div>
                                </section>
                            </div>
                            
                            {/* Lesson Cards Skeletons */}
                            {Array(3).fill(0).map((_, lessonIndex) => (
                                <LessonCardSkeleton key={`lesson-skeleton-${lessonIndex}`} />
                            ))}
                        </div>
                    ))
                ) : (
                    // Show actual content when loaded
                    units.map((unit, index) => (
                        <div key={unit.unit_id} className="mb-8">
                            {/* Unit Divider - Make it sticky */}
                            <div className="sticky top-[4.5rem] z-10 mb-4">
                                <section className="py-4 bg-white/95 backdrop-blur-md shadow-md px-6 max-w-md mx-auto rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xs font-semibold tracking-wider text-gray-500">
                                                UNIT {unit?.order_number} · {unit?.total_lessons || 0} LESSONS
                                            </h2>
                                            <h3 className="mt-1.5 text-lg font-bold text-gray-900">{unit?.title}</h3>
                                        </div>
                                        <div className="flex items-center bg-green-100 px-2.5 py-1 rounded-full">
                                            <span className="text-sm font-medium text-green-700">
                                                {Math.round(unit?.progress_percentage || 0)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative mt-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-300"
                                            style={{ width: `${unit?.progress_percentage || 0}%` }}
                                        ></div>
                                    </div>
                                </section>
                            </div>

                            <Accordion type="single" collapsible className="space-y-4">
                                {lessonsByUnit[unit.unit_id]?.map((lesson) => (
                                    <div key={lesson.lesson_id}>
                                        <LessonCard lesson={lesson} />
                                    </div>
                                ))}
                            </Accordion>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
