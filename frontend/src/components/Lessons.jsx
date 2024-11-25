import React, { useEffect, useState } from 'react';
import { Lock, Unlock, Headphones, BookOpen, Video, Mic, Users, CheckCircle, Coins, ChevronRight } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import LessonActionButton from './StartLearningButton';
import UnitsList from './UnitsList';
import { getLessonsByUnit } from '@/api/lessonService';

const practiceIcons = {
    "Shadowing": <Mic size={14} />,
    "Flashcards": <BookOpen size={14} />,
    "Video Questions": <Video size={14} />,
    "Vocabulary Practice": <BookOpen size={14} />,
    "Listening Activity": <Headphones size={14} />,
    "Listening Practice": <Headphones size={14} />,
};

const parseJSON = (jsonString) => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
    }
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
                return 'border-l-4 border-l-gray-300 bg-gray-100';
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
            className={`mb-4 mt-10 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${getStatusStyles(lesson.status || 'locked')}`}
        >
            <AccordionTrigger className="hover:no-underline px-2 py-4 [&>svg]:hidden group">
                <div className="flex items-center justify-between w-full rounded-lg transition-all duration-200 group-hover:bggray-50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {imageError ? (
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-semibold text-lg text-start">
                                    {getInitials(lesson.title)}
                                </div>
                            ) : (
                                <img
                                    src={`https://tools-api.webcrumbs.org/image-placeholder/48/48/${lesson.title}/1`}
                                    alt={lesson.title}
                                    className="w-14 h-14 rounded-xl object-cover shadow-sm"
                                    onError={() => setImageError(true)}
                                />
                            )}
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
                <div className="px-6 py-4 space-y-4 bg-white/50">
                    <p className="text-sm text-gray-600">{lesson.description}</p>

                    {lesson.grammar_focus && (
                        <div className="space-y-2">
                            <h5 className="text-sm font-semibold text-gray-700">Grammar Focus</h5>
                            <div className="flex flex-wrap gap-2">
                                {parseJSON(lesson.grammar_focus).map((item, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="space-y-1">
                            <h5 className="text-sm font-semibold text-gray-700">Vocabulary</h5>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>{lesson.vocabulary_words} words</span>
                                <span>{lesson.vocabulary_phrases} phrases</span>
                            </div>
                        </div>
                    </div>

                    {lesson.live_session_title && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Users size={16} className="text-blue-600" />
                                <h5 className="text-sm font-semibold text-blue-700">Live Session</h5>
                            </div>
                            <div className="space-y-1 text-sm text-blue-600">
                                <p>{lesson.live_session_title}</p>
                                <div className="flex gap-4">
                                    <span>{lesson.live_session_duration}</span>
                                    <span>Max {lesson.live_session_max_participants} participants</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {lesson.practices && (
                        <div className="space-y-2">
                            <h5 className="text-sm font-semibold text-gray-700">Practice Activities</h5>
                            <div className="flex flex-wrap gap-2">
                                {lesson.practices.map((practice, index) => (
                                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                                        {practiceIcons[practice]}
                                        {practice}
                                    </Badge>
                                ))}
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
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);

    useEffect(() => {
        const fetchLessons = async () => {
            if (!selectedUnitId) {
                console.log("No unit selected yet");
                return;
            }

            try {
                setLoading(true);
                console.log("🔍 Fetching lessons for unit:", selectedUnitId);
                const lessonsData = await getLessonsByUnit(selectedUnitId);
                console.log("📚 Lessons data:", lessonsData);
                setLessons(Array.isArray(lessonsData) ? lessonsData : []);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error fetching lessons:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchLessons();
    }, [selectedUnitId]);

    const handleUnitSelect = (unitId) => {
        console.log("🎯 Selected unit:", unitId);
        setSelectedUnitId(unitId);
    };

    console.log("🎨 Rendering with state:", {
        loading,
        error,
        selectedUnitId,
        lessonsCount: lessons.length
    });

    return (
        <div className="bg-gray-100 mt-[6em]">
            <UnitsList
                onUnitSelect={handleUnitSelect}
                selectedUnitId={selectedUnitId}
            />

            <div className="">
                {loading && (
                    <div className="flex justify-center items-center p4">
                        <span className="text-gray-600">Loading lessons...</span>
                    </div>
                )}

                {error && (
                    <div className="text-red-500 p-4 text-center">
                        <p>Error: {error}</p>
                    </div>
                )}

                {!loading && !error && !selectedUnitId && (
                    <div className="text-gray-500 p-4 text-center">
                        Please select a unit to view lessons
                    </div>
                )}

                {!loading && !error && selectedUnitId && lessons.length === 0 && (
                    <div className="text-gray-500 p-4 text-center">
                        No lessons found for this unit
                    </div>
                )}

                {!loading && !error && selectedUnitId && lessons.length > 0 && (
                    <Accordion type="single" collapsible className="space-y-4">
                        {lessons.map((lesson) => (
                            <LessonCard key={lesson.lesson_id} lesson={lesson} />
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
