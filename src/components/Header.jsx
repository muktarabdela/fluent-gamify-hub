import logo from "../../public/fluent logo.png"

const Header = () => {
    return (
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-50 p-3 border-b">
            <div className="max-w-[430px] mx-auto">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="FluentHub"
                        className="h-8 w-auto"
                    />
                    <div className="flex items-center">
                        <p className="text-base font-bold text-accent">🔥3 days</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-600">likes</p>
                        <p className="text-base font-bold text-primary">150 🩷</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 