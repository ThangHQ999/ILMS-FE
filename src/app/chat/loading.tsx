export default function ChatLoading() {
  return (
    <div className="min-h-screen bg-[#F0F4F9] dark:bg-[#131314] pt-20 pb-4 px-4 sm:px-6 lg:pl-72 flex gap-4">
      <div className="w-80 shrink-0 rounded-3xl bg-white dark:bg-[#1E1F20] p-4 space-y-3 animate-pulse">
        <div className="h-8 w-32 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]" />
        <div className="h-9 rounded-full bg-[#F0F4F9] dark:bg-[#282A2C]" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-2xl bg-[#F0F4F9] dark:bg-[#282A2C]" />
        ))}
      </div>
      <div className="flex-1 rounded-3xl bg-white dark:bg-[#1E1F20] p-6 animate-pulse" />
    </div>
  );
}
