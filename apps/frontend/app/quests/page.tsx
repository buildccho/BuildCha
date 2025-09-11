import QuestCard from "@/components/questCard";

export default function QuestList() {
  return (
    <main className="w-full xl:container max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black py-6">クエスト一覧</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
    </main>
  );
}
