import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, ChefHat } from "lucide-react";

const LiveSessionCard = ({ session }) => {
    const {
        topic,
        participants,
        maxParticipants,
        startTime,
        duration,
        status,
        level,
        scenario,
        host,
    } = session;

    const getStatusColor = (status) => {
        switch (status) {
            case "Ongoing":
                return "text-green-600";
            case "Scheduled":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <Card className="p-4 card-hover bg-white">
            <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ChefHat className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{topic}</h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-600">{scenario}</p>
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>
                                {participants}/{maxParticipants} participants
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{duration}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-gray-600">Level: </span>
                                <span>{level}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Host: </span>
                                <span>{host}</span>
                            </div>
                        </div>
                        <p>
                            <span className="text-gray-600">Status: </span>
                            <span className={`font-medium ${getStatusColor(status)}`}>
                                {status}
                            </span>
                        </p>
                    </div>
                    <Button
                        className="w-full mt-4"
                        variant={status === "Ended" || participants >= maxParticipants ? "secondary" : "default"}
                        disabled={status === "Ended" || participants >= maxParticipants}
                    >
                        {status === "Ended"
                            ? "Session Ended"
                            : participants >= maxParticipants
                                ? "Session Full"
                                : "Join Session"}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default LiveSessionCard; 