export default function CreateClassLoading() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#0B0F19] p-8 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6 pt-16">
        <div className="h-8 w-56 rounded-xl bg-slate-200 dark:bg-[#1E1F20]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 rounded-3xl bg-white dark:bg-[#1E1F20]" />
          <div className="lg:col-span-5 h-72 rounded-3xl bg-white dark:bg-[#1E1F20]" />
        </div>
      </div>
    </div>
  );
}
