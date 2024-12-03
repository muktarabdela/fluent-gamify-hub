import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Mic,
    MessageSquare,
    BookOpen,
    Headphones,
    ScrollText,
    Gamepad2,
} from "lucide-react";
import { getPracticeTopics, getFilteredExercises, getCategories, getExerciseById } from '@/api/practiceService';
import PracticeContainer from '@/components/practice/PracticeContainer';

const Practice = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const [loading, setLoading] = useState(false);
    const scrollContainerRef = useRef(null);
    const [selectedExercise, setSelectedExercise] = useState(null);

    const handleStartExercise = async (exercise) => {
        try {
            const exerciseDetails = await getExerciseById(exercise.id);
            setSelectedExercise(exerciseDetails);
        } catch (error) {
            console.error('Error fetching exercise details:', error);
        }
    };

    useEffect(() => {
        const loadTopicsAndCategories = async () => {
            try {
                const topicsData = await getPracticeTopics();
                const categoriesData = await getCategories();
                console.log("categoriesData", categoriesData);
                console.log("topicsData", topicsData);

                setTopics(topicsData);
                setCategories(categoriesData);

                // Set the first category as selected
                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0]);
                }

                // Optionally set the first topic as selected
                if (topicsData.length > 0) {
                    setSelectedTopicId(topicsData[0].id);
                }
            } catch (error) {
                console.error('Error loading topics and categories:', error);
            }
        };

        loadTopicsAndCategories();
    }, []);

    useEffect(() => {
        const loadExercises = async () => {
            if (!selectedTopicId || !selectedCategory) return;

            try {
                setLoading(true);
                const exercises = await getFilteredExercises(
                    selectedCategory.id,

                    selectedTopicId
                );
                console.log("detail exercises from practice page", exercises)
                setExercises(exercises);
            } catch (error) {
                console.error('Error loading exercises:', error);
            } finally {
                setLoading(false);
            }
        };

        loadExercises();
    }, [selectedCategory, selectedTopicId]);

    const handleCategoryClick = (category, index) => {
        setSelectedCategory(category);

        // Scroll the button into view
        const container = scrollContainerRef.current;
        const buttons = container.getElementsByTagName('button');
        const button = buttons[index];

        if (button) {
            const containerWidth = container.offsetWidth;
            const buttonWidth = button.offsetWidth;
            const scrollLeft = button.offsetLeft - (containerWidth / 2) + (buttonWidth / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    };

    const LevelSelector = () => (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-100 mb-2">Select Level</h3>
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
                {['beginner', 'intermediate', 'advanced'].map((l) => (
                    <Button
                        key={l}
                        variant={level === l ? 'default' : 'ghost'}
                        onClick={() => setLevel(l)}
                        className={cn(
                            "w-full capitalize text-sm py-2",
                            level === l ? "bg-white shadow-sm" : "",
                            level === l ? "text-primary" : "text-gray-600"
                        )}
                    >
                        {l}
                    </Button>
                ))}
            </div>
        </div>
    );

    const TopicSelector = () => (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-100 mb-2">Topics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                {topics.map((topic) => (
                    <Button
                        key={topic.id}
                        variant={selectedTopicId === topic.id ? 'default' : 'outline'}
                        onClick={() => setSelectedTopicId(topic.id)}
                        className={cn(
                            "w-full justify-start text-sm py-2 px-3",
                            selectedTopicId === topic.id ? "bg-primary text-white" : "bg-white ",
                        )}
                    >
                        {topic.name}
                    </Button>
                ))}
            </div>
        </div>
    );

    // If an exercise is selected, show the practice container
    if (selectedExercise) {
        return (
            <div className="min-h-screen">
                <div className="max-w-4xl mx-auto p-4">
                    <Button
                        variant="ghost"
                        className="mb-4"
                        onClick={() => setSelectedExercise(null)}
                    >
                        ← Back to exercises
                    </Button>
                    <PracticeContainer exercise={selectedExercise} />
                </div>
            </div>
        );
    }

    return (
        <div className=" min-h-screen ">
            <div className="max-w-md mx-auto space-y-4">

                {/* Categories Navigation */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md shadow-sm z-10 rounded-lg">
                    <div className="px-2 py-3">
                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto no-scrollbar gap-2"
                        >
                            {categories.map((category, index) => (
                                <Button
                                    key={index}
                                    variant={selectedCategory === category ? "default" : "ghost"}
                                    className={cn(
                                        "flex-shrink-0 flex items-center gap-1.5 text-sm rounded-full px-3 py-1.5",
                                        selectedCategory === category && "bg-primary text-white"
                                    )}
                                    onClick={() => handleCategoryClick(category, index)}
                                >
                                    <span>{category.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-4 pb-20">
                    {/* <LevelSelector /> */}
                    <TopicSelector />

                    {/* Category Header */}
                    {selectedCategory && (
                        <div className="my-4">
                            <div className="flex items-center gap-2 text-gray-100">
                                <div>
                                    <h1 className="text-lg font-bold">{selectedCategory.name}</h1>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dynamic Exercises List */}
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {exercises.map((exercise) => (
                                <Card
                                    key={exercise.id}
                                    className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {exercise.topic}
                                            </h3>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="h-8 px-4 rounded-full hover:scale-105 transition-transform"
                                                onClick={() => handleStartExercise(exercise)}
                                            >
                                                Start
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="inline-flex items-center gap-1">
                                                <ScrollText className="w-4 h-4" />
                                                {exercise.type_name}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span>{exercise.topic_name}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Practice; 