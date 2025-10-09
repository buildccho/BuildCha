"use client";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/rpc-client";
import { useObjectStore } from "@/stores/objectStore";

type History = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<History[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setObjectData = useObjectStore((state) => state.setObjectData);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHistory((prev) => [...prev, { role: "user", content: message }]);
    setIsPending(true);
    try {
      const filteredHistory = history.filter((item, index) => {
        if (item.role === "user") return true;
        if (item.role === "assistant" && index === history.length - 1)
          return true;
        return false;
      });
      const res = await client.ai.createObject.$post({
        json: {
          userInput: message,
          history: JSON.stringify(filteredHistory),
        },
      });
      if (res.status !== 200) {
        setError(res.statusText);
        return;
      }
      const data = await res.json();
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.chat },
      ]);
      setMessage("");
      setObjectData({
        BuildingPartData: {
          parts: data.parts,
        },
      });
      setError(null);
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsPending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <ScrollArea
        className="h-full overflow-y-auto py-5"
        ref={(scrollArea) => {
          if (scrollArea && (history.length > 0 || isPending)) {
            const scrollContainer = scrollArea.querySelector(
              "[data-radix-scroll-area-viewport]",
            );
            if (scrollContainer) {
              scrollContainer.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: "smooth",
              });
            }
          }
        }}
      >
        <div className="grow flex flex-col justify-start gap-6">
          <div className="flex items-center gap-4 max-w-3/4 xl:max-w-2/3">
            <Avatar className="size-12">
              <AvatarImage src="/AICharacter.png" />
            </Avatar>
            <div>何を作るのかな？どんな形にしたい？</div>
          </div>

          {history.map((item, index) =>
            item.role === "assistant" ? (
              <div
                key={`${item.role}-${index}`}
                className="flex items-center gap-4 max-w-3/4 xl:max-w-2/3"
              >
                <Avatar className="size-12">
                  <AvatarImage src="/AICharacter.png" />
                </Avatar>

                <div className="whitespace-pre-wrap">
                  {error ? (
                    <span className="text-red-500">{error}</span>
                  ) : (
                    item.content
                  )}
                </div>
              </div>
            ) : (
              <div
                key={`${item.role}-${index}`}
                className="bg-neutral-100 py-2.5 px-3 rounded-md w-fit self-end max-w-3/4 xl:max-w-2/3 whitespace-pre-wrap"
              >
                {item.content}
              </div>
            ),
          )}
          {isPending && (
            <div className="flex items-center gap-4 max-w-2/3">
              <Avatar className="size-12">
                <AvatarImage src="/AICharacter.png" />
              </Avatar>

              <div className="animate-pulse text-muted-foreground">
                がんばって つくっているよ 🔨🏠
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="relative">
        <form
          className="flex gap-2"
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
        >
          <Textarea
            className="bg-neutral-100 border-none p-4 xl:p-5 resize-none rounded-xl pr-16"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
            placeholder="おおきい おしろみたいな いえ"
          />
          <Button
            variant={"default"}
            size={"icon"}
            className="size-10 text-white rounded-full absolute right-4 top-1/2 -translate-y-1/2"
            disabled={isPending}
          >
            <ArrowUp className="size-6" />
          </Button>
        </form>
      </div>
    </>
  );
}
