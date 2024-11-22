import { useState } from "react";
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

// Dummy data for live sessions
const dummyLiveSessions = [
    {
        id: 1,
        topic: "Coffee Shop Conversations",
        participants: 3,
        maxParticipants: 5,
        startTime: "2024-03-20T14:00:00",
        duration: "30 minutes",
        status: "Ongoing",
        level: "Beginner",
    },
    {
        id: 2,
        topic: "Job Interview Skills",
        participants: 4,
        maxParticipants: 6,
        startTime: "2024-03-20T16:00:00",
        duration: "45 minutes",
        status: "Scheduled",
        level: "Intermediate",
    },
    {
        id: 3,
        topic: "Travel Planning Discussion",
        participants: 0,
        maxParticipants: 4,
        startTime: "2024-03-21T10:00:00",
        duration: "30 minutes",
        status: "Scheduled",
        level: "Beginner",
    },
    {
        id: 4,
        topic: "Business Meeting Practice",
        participants: 5,
        maxParticipants: 5,
        startTime: "2024-03-19T15:00:00",
        duration: "45 minutes",
        status: "Ended",
        level: "Advanced",
    },
];

export default function LiveSession() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("startTime");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filter and sort sessions
    const filteredSessions = dummyLiveSessions
        .filter((session) => {
            const matchesSearch = session.topic.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || session.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "startTime":
                    return new Date(a.startTime) - new Date(b.startTime);
                case "topic":
                    return a.topic.localeCompare(b.topic);
                case "participants":
                    return b.participants - a.participants;
                default:
                    return 0;
            }
        });

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4 pb-20">
                <div className="max-w-md mx-auto space-y-4">
                    {/* Search and filters */}
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
                                    <SelectItem value="Ended">Ended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Session cards */}
                    <div className="space-y-4">
                        {filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white"
                            >
                                <h3 className="text-xl font-semibold mb-2">{session.topic}</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Level:</span>
                                        <span>{session.level}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Participants:</span>
                                        <span>{session.participants}/{session.maxParticipants}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Start Time:</span>
                                        <span>{new Date(session.startTime).toLocaleString()}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Duration:</span>
                                        <span>{session.duration}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`font-medium ${session.status === "Ongoing" ? "text-green-600" :
                                            session.status === "Scheduled" ? "text-blue-600" :
                                                "text-gray-600"
                                            }`}>{session.status}</span>
                                    </p>
                                </div>
                                <Button
                                    className="w-full mt-4"
                                    variant={session.status === "Ended" || session.participants >= session.maxParticipants ? "secondary" : "default"}
                                    disabled={session.status === "Ended" || session.participants >= session.maxParticipants}
                                >
                                    {session.status === "Ended" ? "Session Ended" :
                                        session.participants >= session.maxParticipants ? "Session Full" :
                                            "Join Session"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
} 