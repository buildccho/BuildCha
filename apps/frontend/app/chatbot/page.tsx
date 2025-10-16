import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import ChatBotPanel from "@/features/chatbot/components/chatBotPanel";

export const metadata: Metadata = {
  title: "Q&Aチャットボット | BuildCha",
  description:
    "BuildChaについて分からないことを気軽に質問できるQ&Aチャットボットです。",
};

export default function ChatBotPage() {
  return (
    <main className="flex h-svh flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#dff1ff_0%,_#f6edff_35%,_#ffffff_100%)]">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              ホームへもどる
            </Link>
          </Button>

          <div className="hidden items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm sm:inline-flex">
            <MessageCircle className="size-4 text-primary" />
            BuildCha Q&A Bot
          </div>
        </div>

        <header className="flex flex-col gap-3 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Q&Aチャットボット
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            BuildChaの使い方やクエストの進め方など、わからないことがあったらこのAIに質問してみてね。
          </p>
        </header>

        <section className="relative flex flex-1 min-h-0 rounded-3xl border border-border/70 bg-white/90 p-4 shadow-2xl backdrop-blur-md sm:p-6 lg:p-8">
          <ChatBotPanel />
        </section>
      </div>
    </main>
  );
}
