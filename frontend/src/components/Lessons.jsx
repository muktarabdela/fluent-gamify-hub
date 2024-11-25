import React, { useEffect, useState, useRef } from 'react';
import { Lock, Unlock, Headphones, BookOpen, Video, Mic, Users, CheckCircle, Coins, ChevronRight } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import LessonActionButton from './StartLearningButton';
import UnitsList from './UnitsList';
import { getAllUnits } from '@/api/unitService';
import { getLessonsByUnit } from '@/api/lessonService';
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

export default function MobileLessonDashboard() {
    const [units, setUnits] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
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
        <div className="bg-gray-100 mt-[6em]">
            <UnitsList visibleUnitId={visibleUnit} />

            <div className="container mx-auto px-4">
                {units.map((unit, index) => (
                    <div key={unit.unit_id} className="mb-8">
                        {/* Unit Divider - Only show for units after the first one */}
                        {index > 0 && (
                            <div
                                ref={el => unitDividerRefs.current[unit.unit_id] = el}
                                data-unit-id={unit.unit_id}
                                className="bg-gray-700 rounded-lg shadow-md flex flex-col items-center py-4 mb-6 z-40"
                            >
                                <div className="h-4" />
                                <h6 className="text-neutral-500 text-sm tracking-wider">
                                    UNIT {unit.order_number}
                                </h6>
                                <h1 className="text-neutral-50 font-title text-xl font-semibold flex items-center gap-4">
                                    {unit.title}
                                </h1>
                                <div className="h-4" />
                            </div>
                        )}

                        <Accordion type="single" collapsible className="space-y-4">
                            {lessonsByUnit[unit.unit_id]?.map((lesson) => (
                                <div key={lesson.lesson_id}>
                                    <LessonCard lesson={lesson} />
                                </div>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>
        </div>
    );
}
