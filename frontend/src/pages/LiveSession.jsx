import { useState, useEffect } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import logo from "../../public/fluent logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { completeUserSession, getSessionsByType, joinSession, updateSessionStatus, updateSessionTelegramChat } from "@/api/liveSessionService";
import { getTelegramUser } from "@/utils/telegram";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Users } from "lucide-react";
import { useLocation } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { createNewSession } from "@/api/botService";
import { getAvailableGroup } from "@/api/telegramGroupService";
import { useToast } from "@/components/ui/use-toast";

export default function LiveSession() {
    const telegramUser = getTelegramUser();
    const location = useLocation();
    const fromLesson = location.state?.fromLesson;

    const [activeTab, setActiveTab] = useState("lesson");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("startTime");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sessions, setSessions] = useState([]);
    const [groupId, setGroupId] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [joinStatus, setJoinStatus] = useState({ loading: false, error: null, inviteLink: null });
    const { toast } = useToast();

    // Fetch sessions when tab changes or status filter changes
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                const status = statusFilter !== 'all' ? statusFilter : null;
                const userId = telegramUser.id;
                const data = await getSessionsByType('free_talk', status, userId);
                setSessions(data);
                console.log(data)
                setError(null);
            } catch (err) {
                console.error('Error fetching sessions:', err);
                setError('Failed to load sessions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [statusFilter]);

    // Filter and sort sessions
    const filteredSessions = sessions
        .filter((session) => {
            const matchesSearch = session.topic.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "startTime":
                    return new Date(a.start_time) - new Date(b.start_time);
                case "topic":
                    return a.topic.localeCompare(b.topic);
                case "participants":
                    return b.current_participants - a.current_participants;
                default:
                    return 0;
            }
        });

    const NoSessionsMessage = ({ type }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-blue-100"
        >
            <div className="text-center space-y-4">
                {type === 'freeTalk' ? (
                    <>
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-blue-900">
                            No Practice Sessions Available Yet
                        </h3>
                        <p className="text-blue-600 max-w-md mx-auto">
                            Great job completing your lessons! We're preparing new practice sessions.
                            Check back soon or try our free talk sessions to practice your skills.
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <div className="text-center">
                                <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-blue-600">Regular Updates</p>
                            </div>
                            <div className="text-center">
                                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <p className="text-sm text-blue-600">Group Practice</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="mt-4 border-blue-200 hover:bg-blue-50"
                            onClick={() => setActiveTab("freeTalk")}
                        >
                            Try Free Talk Sessions
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Users className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-indigo-900">
                            No Free Talk Sessions Right Now
                        </h3>
                        <p className="text-indigo-600 max-w-md mx-auto">
                            We're setting up new conversation sessions.
                            Check back soon to join exciting discussions with fellow learners!
                        </p>
                    </>
                )}
            </div>
        </motion.div>
    );

    const getSessionButton = (session, handleJoinSession, joinStatus) => {
        // console.log(session)
        // Check if session is full
        const isFull = session.current_participants >= session.max_participants;

        // if (session.user_status === 'completed') {
        //     return (
        //         <Button
        //             className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
        //             variant="default"
        //             onClick={() => toast({
        //                 title: "Session Completed",
        //                 description: "You have already completed this session.",
        //                 duration: 3000
        //             })}
        //         >
        //             Completed
        //         </Button>
        //     );
        // }

        if (session.status === 'Ongoing') {
            return (
                <Button
                    className="w-full mt-4 bg-green-500"
                    variant="default"
                    onClick={() => {
                        window.open(session.inviteLink, '_blank');
                        handleJoinSession(session);
                    }}
                >
                    Join Now
                </Button>
            );
        }

        if (session.status === 'Ended') {
            return (
                <Button
                    className="w-full mt-4"
                    variant="outline"
                    disabled
                >
                    Session Ended
                </Button>
            );
        }

        // Add full session check
        if (isFull) {
            return (
                <Button
                    className="w-full mt-4"
                    variant="outline"
                    disabled
                >
                    Session Full ({session.current_participants}/{session.max_participants})
                </Button>
            );
        }

        return (
            <Button
                className="w-full mt-4"
                variant="default"
                onClick={() => handleInitialClick(session)}
            >
                Create Session
            </Button>
        );
    };

    const handleInitialClick = async (session) => {
        console.log("session", session)
        setSelectedSession(session);
        setIsJoinDialogOpen(true);
        setJoinStatus({ loading: true, error: null, inviteLink: null });

        try {
            // Optimistically update UI
            const updatedSessions = sessions.map(s =>
                s.session_id === session.session_id
                    ? { ...s, status: 'Creating...' }
                    : s
            );
            setSessions(updatedSessions);

            // Parallel API calls
            const [availableGroup, joinSessionResponse] = await Promise.all([
                getAvailableGroup(),
                joinSession(session.session_id, telegramUser.id)
            ]);

            if (!availableGroup) {
                throw new Error('No available groups found');
            }

            // Create new session
            const data = await createNewSession({
                topic: session.topic,
                sessionId: session._id,
                group_id: availableGroup.telegram_chat_id,
                duration: session.duration
            });

            // Parallel updates
            await Promise.all([
                // completeUserSession(session.session_id, telegramUser.id),
                // updateSessionStatus(session.session_id, 'Ongoing', data.inviteLink),
                // updateSessionTelegramChat(session.session_id, availableGroup.telegram_chat_id),
            ]);

            setJoinStatus({
                loading: false,
                error: null,
                inviteLink: data.inviteLink,
            });

            // Final UI update
            const finalUpdatedSessions = sessions.map(s =>
                s.session_id === session.session_id
                    ? {
                        ...s,
                        status: 'Ongoing',
                        inviteLink: data.inviteLink,
                        user_status: ''
                    }
                    : s
            );
            setSessions(finalUpdatedSessions);

        } catch (error) {
            console.error('Error creating session:', error);
            setJoinStatus({
                loading: false,
                error: error.message || 'Failed to create session. Please try again.',
                inviteLink: null,
            });

            // Revert optimistic update
            const revertedSessions = sessions.map(s =>
                s.session_id === session.session_id
                    ? { ...s, status: 'Scheduled' }
                    : s
            );
            setSessions(revertedSessions);
        }
    };

    const handleJoinSession = async (session, groupId) => {
        console.log("session is handle join session ", session)
        try {
            // Create new session with the obtained groupId
            // const data = await createNewSession({
            //     topic: session.topic,
            //     sessionId: session.session_id,
            //     group_id: groupId
            // });

            // Update the session status to Ongoing
            // await updateSessionStatus(session.session_id, 'Ongoing', data.inviteLink);
            // await updateSessionTelegramChat(session.session_id, groupId);

            // First join the session
            await joinSession(session.session_id, telegramUser.id);

            // Then complete it
            await completeUserSession(session.session_id, telegramUser.id);

            setJoinStatus({
                loading: false,
                error: null,
                inviteLink: data.inviteLink,
            });

            // Update the sessions list
            const updatedSessions = sessions.map(s =>
                s.session_id === session.session_id
                    ? {
                        ...s,
                        status: 'Ongoing',
                        inviteLink: data.inviteLink,
                        user_status: 'completed'
                    }
                    : s
            );
            setSessions(updatedSessions);

        } catch (error) {
            console.error('Error creating session:', error);
            setJoinStatus({
                loading: false,
                error: error.message || 'Failed to create session. Please try again.',
                inviteLink: null,
            });
        }
    };

    return (
        <>
            <div className="min-h-screen p-4 pb-20">
                <div className="max-w-md mx-auto space-y-4">
                    {/* Add tabs */}
                    {/* <Tabs defaultValue="lesson" onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                                value="lesson"
                                className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-800"
                            >
                                Lesson Sessions
                            </TabsTrigger>
                            <TabsTrigger
                                value="freeTalk"
                                className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-800"
                            >
                                Free Talk
                            </TabsTrigger>
                        </TabsList>
                    </Tabs> */}
                    <div className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium text-center shadow-sm">Free Talk</div>
                    {/* Search and filters */}
                    {filteredSessions.length > 0 && (
                        <div className="flex flex-col gap-4 mb-6">
                            <Input
                                type="search"
                                placeholder="Search by topic..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <div className="flex gap-2">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="startTime">Start Time</SelectItem>
                                        <SelectItem value="topic">Topic</SelectItem>
                                        <SelectItem value="participants">Participants</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Show loading state */}
                    {loading && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-blue-600">Loading sessions...</p>
                        </div>
                    )}

                    {/* Show error state */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    {/* Session cards or no sessions message */}
                    {!loading && !error && (
                        <div className="space-y-4">
                            {filteredSessions.length > 0 ? (
                                filteredSessions.map((session) => (
                                    <div key={session.session_id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
                                        {activeTab === "lesson" && session.lesson_title && (
                                            <div className="text-sm text-blue-600 mb-1">
                                                Lesson: {session.lesson_title}
                                            </div>
                                        )}
                                        <h3 className="text-xl font-semibold mb-2">{session.topic}</h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="flex justify-between">
                                                <span className="text-gray-600">Level:</span>
                                                <span>{session.level}</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="text-gray-600">Participants:</span>
                                                <span>{session.current_participants}/{session.max_participants}</span>
                                            </p>
                                            {/* <p className="flex justify-between">
                                                <span className="text-gray-600">Start Time:</span>
                                                <span>{new Date(session.start_time).toLocaleString()}</span>
                                            </p> */}
                                            <p className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span>{session.duration} minutes</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`font-medium ${session.status === 'completed' ? "text-green-600" :
                                                    session.status === "Ongoing" ? "text-green-600" :
                                                        session.status === "Scheduled" ? "text-blue-600" :
                                                            "text-gray-600"
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </p>
                                        </div>
                                        {getSessionButton(session, handleJoinSession, joinStatus)}
                                    </div>
                                ))
                            ) : (
                                <NoSessionsMessage type={activeTab} />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Dialog */}
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Join Live Session</DialogTitle>
                        <DialogDescription>
                            {selectedSession?.topic}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {joinStatus.loading && (
                            <div className="text-center">
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p>Creating session...</p>
                            </div>
                        )}

                        {joinStatus.error && (
                            <div className="text-red-500 text-center">
                                {joinStatus.error}
                            </div>
                        )}

                        {joinStatus.inviteLink && (
                            <div className="text-center space-y-4">
                                <p className="text-green-600">Session created successfully!</p>
                                <Button
                                    className="w-full bg-green-500 hover:bg-green-500"
                                    onClick={() => window.open(joinStatus.inviteLink, '_blank')}
                                >
                                    Join Now
                                </Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsJoinDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 