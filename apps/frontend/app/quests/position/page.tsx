import MyTown from "@/components/myTown";

export default function PositionPage() {
  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col">
      <div className="grid mx-auto w-full px-6 py-6 gap-6 grow">
        <h1 className="font-bold text-xl">街に配置しよう</h1>
        <MyTown />
      </div>
    </main>
  );
}
