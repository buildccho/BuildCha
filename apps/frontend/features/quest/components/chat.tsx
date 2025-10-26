"use client";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { client } from "@/lib/rpc-client";
import { type History, useObjectStore } from "@/stores";

const MODEL_NAMES = [
  { value: "gpt-4.1-nano", label: "かんたんAI（はやい）" },
  { value: "gpt-4.1-mini", label: "ふつうAI（バランス）" },
  { value: "gpt-4.1", label: "すごいAI（かしこい）" },
];

export default function Chat() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<History[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setObjectData = useObjectStore((state) => state.setObjectData);
  const setName = useObjectStore((state) => state.setName);
  const setChatHistory = useObjectStore((state) => state.setChatHistory);

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
      const formData = new FormData(e.currentTarget);
      const modelName = formData.get("model") as string;
      const res = await client.ai.createObject.$post({
        json: {
          modelName,
          userInput: message,
          history: JSON.stringify(filteredHistory),
        },
      });
      if (res.status !== 200) {
        setError(res.statusText);
        return;
      }
      const data = await res.json();
      const newHistory: History[] = [
        ...history,
        { role: "user" as const, content: message },
        { role: "assistant" as const, content: data.chat },
      ];
      setHistory(newHistory);
      setMessage("");
      setObjectData({
        BuildingPartData: {
          parts: data.parts,
        },
      });
      setName(data.name);
      setChatHistory(newHistory);
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
        className="h-full overflow-y-auto py-3 xl:py-5"
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

      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <InputGroup className="rounded-xl p-1 bg-muted/40">
          <InputGroupTextarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="おおきい おしろみたいな いえ"
          />
          <InputGroupAddon align="block-end" className="justify-between">
            <Select name="model" defaultValue="gpt-4.1-mini">
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="モデルをえらぶ" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectLabel>AIをえらぶ</SelectLabel>
                  {MODEL_NAMES.map((model) => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className="py-2"
                    >
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputGroupButton
              type="submit"
              disabled={isPending || !message}
              variant="default"
              className="rounded-full size-10"
              size="icon-sm"
            >
              {isPending ? (
                <Spinner />
              ) : (
                <>
                  <ArrowUp className="size-6" />
                  <span className="sr-only">Send</span>
                </>
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  );
}
