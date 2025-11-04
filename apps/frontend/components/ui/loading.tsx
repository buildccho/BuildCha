export function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* シンプルなスピナー */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />

        {/* ローディングテキスト */}
        <p className="text-lg font-medium text-gray-600">よみこみ中...</p>
      </div>
    </div>
  );
}
