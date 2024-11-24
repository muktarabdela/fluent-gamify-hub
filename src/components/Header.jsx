import { Link } from "react-router-dom";
import logo from "../../public/fluent logo.png"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const Header = () => {
    return (
        <header className="sticky top-0 bg-white/95 backdrop-blur-md z-50 shadow-sm">
            <div className="max-w-[430px] mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-4">
                        <img
                            src={logo}
                            alt="FluentHub"
                            className="h-9 w-auto transition-transform hover:scale-105"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center bg-gradient-to-r from-orange-100 to-orange-50 px-3 py-1.5 rounded-full cursor-pointer hover:from-orange-200 hover:to-orange-100 transition-colors">
                                    <span className="mr-1.5 animate-bounce">🔥</span>
                                    <p className="text-sm font-semibold text-orange-600">3 days streak!</p>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>Streak Details</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Current Streak</span>
                                            <span className="font-medium">3 days</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Longest Streak</span>
                                            <span className="font-medium">7 days</span>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Link>

                    <Link to="/profile" className="flex items-center gap-3">
                        <button className="relative group p-2.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700 group-hover:text-gray-900">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></span>
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header; 