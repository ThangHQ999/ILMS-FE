import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white">
      <div className="max-w-lg w-full rounded-2xl bg-white dark:bg-[#161D2F] p-8 border border-slate-200 dark:border-slate-800 shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-2">Chính sách bảo mật</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Chính sách bảo mật thông tin và tuân thủ tiêu chuẩn GDPR, ISO 27001 của hệ thống ILMS.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
