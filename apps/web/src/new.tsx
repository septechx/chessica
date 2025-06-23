import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupCard } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { Color, NewGameBody, NewGameResponse } from "@chessica/protocol";
import { useNavigate } from "./router";

function New() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const form = useRef<HTMLFormElement | null>(null);

  const navigate = useNavigate();

  async function createGame() {
    try {
      const formData = new FormData(form.current!);
      const color: Color = formData.get("color") as Color;

      const body: NewGameBody = {
        color,
      };

      setLoading(true);

      const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      const response = await fetch(`${serverUrl}/api/game`, {
        body: JSON.stringify(body),
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const json: NewGameResponse = await response.json();
        const gameId = json.gameId;

        navigate("/play", { gameId });
      } else {
        setError(`Server returned status code ${response.status}`);
      }

      setLoading(false);
    } catch {
      setError("Unexpected error whilst trying to create game");
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create a game</CardTitle>
          <CardDescription>
            Create a game and get a link to share
          </CardDescription>
          <CardAction>
            <Button variant="link" className="cursor-pointer">
              Join game
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form ref={form}>
            <div className="flex flex-col gap-6">
              <div>
                <RadioGroup name="color" defaultValue="White" className="flex">
                  <RadioGroupCard
                    value="White"
                    className="cursor-pointer"
                    defaultChecked
                  >
                    <div className="p-1">
                      <img
                        alt="white"
                        src="/white_king.svg"
                        height={32}
                        width={32}
                      />
                    </div>
                  </RadioGroupCard>
                  <RadioGroupCard value="Black" className="cursor-pointer">
                    <div className="p-1">
                      <img
                        alt="black"
                        src="/black_king.svg"
                        height={32}
                        width={32}
                      />
                    </div>
                  </RadioGroupCard>
                </RadioGroup>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
            onClick={() => createGame()}
          >
            Create game
          </Button>
          {error ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Unable to create game.</AlertTitle>
              <AlertDescription>
                <p>{error}</p>
              </AlertDescription>
            </Alert>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}

export default New;
