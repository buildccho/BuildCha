import QuestCard from "@/components/questCard";

export default function QuestList() {
  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="xl:container max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-black py-6">クエスト一覧</h1>
        <div className="flex gap-4 flex-wrap">
          <QuestCard difficulty="easy" />
          <QuestCard difficulty="easy" />
          <QuestCard difficulty="easy" />
          <QuestCard difficulty="normal" />
          <QuestCard difficulty="normal" />
          <QuestCard difficulty="normal" />
          <QuestCard difficulty="hard" />
          <QuestCard difficulty="hard" />
          <QuestCard difficulty="hard" />
          <QuestCard difficulty="hard" />
        </div>
      </div>
    </main>
  );
}
