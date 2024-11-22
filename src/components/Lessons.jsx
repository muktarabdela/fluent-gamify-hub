import React from 'react';
import { Lock, Unlock, Headphones, BookOpen, Video, Mic, Users, CheckCircle, Coins, ChevronRight } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LessonActionButton from './StartLearningButton';

const lessonsData = [
    {
        id: 1,
        title: "Ordering Food at a Restaurant",
        isLocked: false,
        status: 'completed',
        progress: 0,
        situation: "Learn how to order food in a casual dining setting.",
        grammarFocus: ["Present tense verbs", "Polite requests"],
        vocabulary: {
            words: 20,
            phrases: 10
        },
        exercises: ["Role-play dialogues", "Menu comprehension", "Listening practice"],
        coins: 50,
        practices: ["Shadowing", "Flashcards", "Video Questions"],
        liveSession: {
            title: "Practice Ordering in a Virtual Restaurant",
            participants: 4,
            duration: "30 minutes"
        }
    },
    {
        id: 2,
        title: "Booking a Hotel Room",
        isLocked: false,
        status: 'active',
        progress: 0,
        situation: "Learn phrases and tips for booking accommodations.",
        grammarFocus: ["Future tense", "Question forms"],
        vocabulary: {
            words: 25,
            phrases: 15
        },
        exercises: ["Reservation dialogues", "Listening practice", "Vocabulary matching"],
        coins: 60,
        practices: ["Vocabulary Practice", "Listening Activity"],
        liveSession: {
            title: "Role-play Hotel Booking Scenarios",
            participants: 3,
            duration: "45 minutes"
        }
    },
    {
        id: 3,
        title: "Introducing Yourself",
        isLocked: true,
        status: 'locked',
        progress: 0,
        situation: "Basic phrases to introduce yourself confidently.",
        grammarFocus: ["Simple present", "Personal pronouns"],
        vocabulary: {
            words: 15,
            phrases: 8
        },
        exercises: ["Introduction role-play", "Pronunciation practice"],
        coins: 40,
        practices: ["Shadowing", "Flashcards"],
        liveSession: {
            title: "Group Introduction Practice",
            participants: 5,
            duration: "20 minutes"
        }
    },
    {
        id: 4,
        title: "Shopping for Groceries",
        isLocked: true,
        status: 'locked',
        progress: 0,
        situation: "Understand common phrases for grocery shopping.",
        grammarFocus: ["Countable and uncountable nouns", "Quantifiers"],
        vocabulary: {
            words: 30,
            phrases: 12
        },
        exercises: ["Shopping list comprehension", "Listening activity", "Dialogue practice"],
        coins: 55,
        practices: ["Listening Practice", "Flashcards", "Video Questions"],
        liveSession: {
            title: "Virtual Grocery Shopping Experience",
            participants: 4,
            duration: "40 minutes"
        }
    },
    {
        id: 5,
        title: "Taking Public Transportation",
        isLocked: true,
        status: 'locked',
        progress: 0,
        situation: "Learn how to navigate public transport effectively.",
        grammarFocus: ["Prepositions of place", "Imperative sentences"],
        vocabulary: {
            words: 18,
            phrases: 9
        },
        exercises: ["Route planning", "Listening comprehension", "Dialogues"],
        coins: 50,
        practices: ["Shadowing", "Flashcards"],
        liveSession: {
            title: "Simulated Public Transport Journey",
            participants: 3,
            duration: "35 minutes"
        }
    },
    {
        id: 6,
        title: "Attending a Meeting",
        isLocked: true,
        status: 'locked',
        progress: 0,
        situation: "Key phrases for professional communication in meetings.",
        grammarFocus: ["Formal language", "Passive voice"],
        vocabulary: {
            words: 22,
            phrases: 14
        },
        exercises: ["Meeting role-play", "Listening activity", "Key phrase matching"],
        coins: 70,
        practices: ["Listening Activity", "Video Questions"],
        liveSession: {
            title: "Mock Business Meeting Roleplay",
            participants: 6,
            duration: "50 minutes"
        }
    }
];

const practiceIcons = {
    "Shadowing": <Mic size={14} />,
    "Flashcards": <BookOpen size={14} />,
    "Video Questions": <Video size={14} />,
    "Vocabulary Practice": <BookOpen size={14} />,
    "Listening Activity": <Headphones size={14} />,
    "Listening Practice": <Headphones size={14} />,
};

function LessonCard({ lesson }) {
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

    return (
        <AccordionItem value={`item-${lesson.id}`} className={`mb-4 rounded-lg overflow-hidden shadow-md transition-all duration-300 ${getStatusStyles(lesson.status)}`}>
            <AccordionTrigger className="hover:no-underline px-4 py-3">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-3">
                        {lesson.status === 'completed' ? (
                            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                        ) : lesson.isLocked ? (
                            <Lock className="text-gray-500 flex-shrink-0" size={20} />
                        ) : (
                            <Unlock className="text-blue-500 flex-shrink-0" size={20} />
                        )}
                        <div>
                            <h2 className="text-md font-semibold text-gray-800">{lesson.title}</h2>
                            
                            {/* <Progress value={lesson.progress} className="w-24 h-1 mt-1" /> */}
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="px-4 py-3 space-y-4">
                    <p className="text-sm text-gray-600">{lesson.situation}</p>

                    <div className="border-t pt-3">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Grammar Focus:</h3>
                        <div className="flex flex-wrap gap-2">
                            {lesson.grammarFocus.map((point, index) => (
                                <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                    <span className="ml-1 text-xs">{point}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Vocabulary:</h3>
                        <div className="flex space-x-4">
                            <Badge variant="outline">{lesson.vocabulary.words} words</Badge>
                            <Badge variant="outline">{lesson.vocabulary.phrases} phrases</Badge>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-1">
                            🩷
                        </span>
                        <span className="text-sm font-medium text-gray-700">{lesson.coins} likes</span>
                    </div>

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

                    <div className="bg-yellow-100 rounded-md p-3">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                            <Users size={16} className="mr-2" />
                            Live Group Session
                        </h3>
                        <p className="text-sm text-yellow-800 mb-1">{lesson.liveSession.title}</p>
                        <div className="flex justify-between text-xs text-yellow-700">
                            <span>{lesson.liveSession.participants} participants</span>
                            <span>{lesson.liveSession.duration}</span>
                        </div>
                    </div>

                    <LessonActionButton
                        status={lesson.status}
                        onClick={() => console.log(`Action for: ${lesson.title}`)}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}


export default function MobileLessonDashboard() {
    return (
        <div className="bg-gra-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Language Learning</h1>
            <Accordion type="single" collapsible className="space-y-4">
                {lessonsData.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                ))}
            </Accordion>
        </div>
    );
}
