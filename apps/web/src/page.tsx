import { Button } from "@/components/ui/button";
import { useNavigate } from "./router";
import { useState } from "react";

function Homepage() {
    const navigate = useNavigate();
    const [resetting, setResetting] = useState(false);

    function handleCreateGame() {
        navigate("/new");
    }

    function handleResetUserId() {
        setResetting(true);
        localStorage.removeItem("uid");
        localStorage.setItem("uid", crypto.randomUUID());
        window.location.reload();
    }

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center gap-6 bg-background">
            <h1 className="text-4xl font-bold mb-2">Welcome to Chessica</h1>
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button className="w-full" onClick={handleCreateGame}>
                    Create Game
                </Button>
                <Button className="w-full" variant="outline" onClick={handleResetUserId} disabled={resetting}>
                    {resetting ? "Resetting..." : "Reset User ID"}
                </Button>
            </div>
        </div>
    );
}

export default Homepage;