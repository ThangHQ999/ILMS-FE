import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#E1E5EA] dark:bg-[#131314] text-[#1F1F1F] dark:text-[#E3E3E3]">
      <div className="max-w-lg w-full rounded-3xl bg-white dark:bg-[#1E1F20] p-8 border-none shadow-none text-center">
        <h1 className="text-2xl font-bold mb-2">Điều khoản dịch vụ</h1>
        <p className="text-sm text-[#747775] dark:text-[#C4C7C5] mb-6">
          Quy định sử dụng nền tảng học tập thông minh ILMS (EduTech Innovations).
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#D3E3FD] hover:bg-[#B9D0F9] text-[#041E49] dark:bg-[#A8C7FA] dark:hover:bg-[#8AB4F8] dark:text-[#062E6F] whitespace-nowrap font-medium border-none shadow-none transition-colors"
        >
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
