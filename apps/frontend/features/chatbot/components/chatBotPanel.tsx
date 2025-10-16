"use client";

import { SendHorizonal, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { client } from "@/lib/rpc-client";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const createMessage = (role: ChatRole, content: string): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
});

const BOT_WELCOME =
  "こんにちは！建ものづくりのコツやBuildChaの使い方でわからないことがあったら気軽に聞いてね。";

export function ChatBotPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage("assistant", BOT_WELCOME),
  ]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const messageCount = messages.length;

  useEffect(() => {
    if (!messageCount && !isPending) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messageCount, isPending]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = createMessage("user", trimmed);
    const nextHistory = [...messages, userMessage];

    setMessages(nextHistory);
    setInput("");
    setError(null);
    setIsPending(true);

    try {
      const response = await client.ai.chatBot.$post({
        json: {
          userMessage: trimmed,
          chatHistory: nextHistory.map(({ role, content }) => ({
            role,
            content,
          })),
        },
      });

      if (response.status !== 200) {
        const body = await safeParseError(response);
        throw new Error(body ?? response.statusText);
      }

      const data = (await response.json()) as { response: string };
      const assistantMessage = createMessage("assistant", data.response);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "チャットの送信に失敗しました。";
      setError(message);
    } finally {
      setIsPending(false);
    }
  };

  const canSubmit = input.trim().length > 0 && !isPending;

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-hidden min-h-0">
      <ScrollArea className="flex-1 h-full min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-4 shadow-inner">
        <div className="flex flex-col gap-5">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isPending && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Avatar className="size-10">
                <AvatarImage src="/AICharacter.png" alt="BuildCha Bot" />
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs">
                <Spinner className="size-3" />
                こたえを考えています…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="chatbot-question">
          質問を入力
        </label>
        <InputGroup className="bg-white">
          <InputGroupInput
            id="chatbot-question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="例：スコアを上げるコツはある？"
            autoComplete="off"
            disabled={isPending}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              disabled={!canSubmit}
              size="sm"
              className="font-semibold"
            >
              {isPending ? (
                <>
                  <Spinner className="size-4" />
                  送信中…
                </>
              ) : (
                <>
                  <SendHorizonal className="size-4" />
                  送信
                </>
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}

type ChatBubbleProps = {
  message: ChatMessage;
};

function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  if (isAssistant) {
    return (
      <div className="flex items-start gap-3">
        <Avatar className="size-10">
          <AvatarImage src="/AICharacter.png" alt="BuildCha Bot" />
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
        <div className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-inset ring-border/60">
          <p className="whitespace-pre-line leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-end">
      <div className="flex max-w-[75%] items-start gap-3">
        <div className="rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
          <p className="whitespace-pre-line leading-relaxed">
            {message.content}
          </p>
        </div>
        <Avatar className="size-10 border-2 border-primary/20">
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

async function safeParseError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message;
  } catch {
    return null;
  }
}

export default ChatBotPanel;
