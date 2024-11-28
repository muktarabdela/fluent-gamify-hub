import React, { useEffect, useState, useRef } from 'react';
import { Lock, Unlock, Headphones, BookOpen, Video, Mic, Users, CheckCircle, Coins, ChevronRight, BookMarked, Book, MessageSquare, Gamepad2, Users2, Clock } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import LessonActionButton from './StartLearningButton';
import { getAllUnits } from '@/api/unitService';
import { getLessonsByUnit } from '@/api/lessonService';
import { Skeleton } from "@/components/ui/skeleton";
import image from "../../public/fluent logo.png"
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
                return 'border-l-4 border-l-gray-300 bg-gray-200';
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
            className={`mb-4 -mt-1 rounded-lg overflow-hidden shadow-md transition-all duration-300 ${getStatusStyles(lesson.status)}`}
        >
            <AccordionTrigger className="hover:no-underline px-4 py-6 [&>svg]:hidden group">
                <div className="flex items-center justify-between w-full rounded-xl transition-all duration-300  backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                                <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                                    <img
                                        src={`https://tools-api.webcrumbs.org/image-placeholder/48/48/${lesson.topic}/1`}
                                        alt={lesson.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 
                                    transition-transform duration-300"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            </div>
                            {lesson.status === 'completed' && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white transform hover:scale-110 transition-transform">
                                    <CheckCircle size={16} className="text-white" strokeWidth={2.5} />
                                </div>
                            )}
                            {(!lesson.status || lesson.status === 'locked') && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white transform hover:scale-110 transition-transform">
                                    <Lock size={16} className="text-white" strokeWidth={2.5} />
                                </div>
                            )}
                            {lesson.status === 'active' && (
                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg ring-2 ring-white transform hover:scale-110 transition-transform">
                                    <ChevronRight size={16} className="text-white" strokeWidth={2.5} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold text-start text-gray-800 group-hover:text-primary transition-colors">
                                    {lesson.title}
                                </h4>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 text-start leading-relaxed group-hover:text-gray-700 transition-colors">
                                {lesson.description}
                            </p>
                        </div>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent>
                <div className="px-6 py-4 space-y-6 bg-white/50 backdrop-blur-sm rounded-xl">
                    {/* Description with styled typography */}
                    <p className="text-sm leading-relaxed text-gray-600 font-medium">{lesson.description}</p>

                    {/* Grammar Focus Section */}
                    {lesson.grammar_focus && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Grammar Focus
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {parseJSON(lesson.grammar_focus).map((point, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full hover:bg-primary/20 transition-colors"
                                    >
                                        {point}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vocabulary Stats */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <BookMarked className="w-4 h-4 text-primary" />
                            Vocabulary
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                                <Book className="w-4 h-4 text-blue-600" />
                                <div>
                                    <div className="text-lg font-bold text-blue-600">{lesson.vocabulary_words}</div>
                                    <div className="text-xs text-blue-600/80">New Words</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-indigo-50 p-3 rounded-lg">
                                <MessageSquare className="w-4 h-4 text-indigo-600" />
                                <div>
                                    <div className="text-lg font-bold text-indigo-600">{lesson.vocabulary_phrases}</div>
                                    <div className="text-xs text-indigo-600/80">Key Phrases</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Practices */}
                    {lesson.practices && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <Gamepad2 className="w-4 h-4 text-primary" />
                                Interactive Practices
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {lesson.practices.map((practice, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors"
                                    >
                                        {practiceIcons[practice]}
                                        <span className="ml-1.5">{practice}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Session Card */}
                    {lesson.live_session_title && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200/50 shadow-sm">
                            <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-600" />
                                Live Group Session
                            </h3>
                            <p className="text-sm text-amber-800 font-medium mb-3">{lesson.live_session_title}</p>
                            <div className="flex justify-between text-xs text-amber-700/90">
                                <span className="flex items-center gap-1">
                                    <Users2 className="w-3.5 h-3.5" />
                                    Max {lesson.live_session_max_participants} participants
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {lesson.live_session_duration}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                        <LessonActionButton
                            status={lesson.status || 'locked'}
                            lessonId={lesson.lesson_id}
                        />
                    </div>
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
        <div className="bg-gra0">
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
