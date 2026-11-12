'use client';

import React, { useState, useMemo } from 'react';
import type { ClassMember } from '../../schemas/class-detail.schema';

interface ClassMembersTabProps {
  members: ClassMember[];
  currentRole: 'owner' | 'teacher';
  onApproveMember: (member: ClassMember) => void;
  onRejectMember: (member: ClassMember) => void;
  onInviteClick: () => void;
}

export function ClassMembersTab({
  members,
  currentRole,
  onApproveMember,
  onRejectMember,
  onInviteClick,
}: ClassMembersTabProps) {
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TEACHER' | 'STUDENT' | 'PENDING'>('ALL');
  const [search, setSearch] = useState('');

  const filteredMembers = useMemo(() => {
    let list = [...members];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.studentCode && m.studentCode.toLowerCase().includes(q))
      );
    }
    if (roleFilter === 'TEACHER') {
      list = list.filter((m) => m.role === 'TEACHER' || m.role === 'OWNER');
    } else if (roleFilter === 'STUDENT') {
      list = list.filter((m) => m.role === 'STUDENT' && m.status === 'APPROVED');
    } else if (roleFilter === 'PENDING') {
      list = list.filter((m) => m.status === 'PENDING');
    }
    return list;
  }, [members, search, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Thành viên của lớp ({members.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Quản lý danh sách giảng viên, sinh viên và xét duyệt các yêu cầu ghi danh.
          </p>
        </div>

        <button
          type="button"
          onClick={onInviteClick}
          className="px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-2 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[19px]">person_add</span>
          <span>Mời thành viên</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, MSSV..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">Tất cả thành viên</option>
            <option value="TEACHER">Giảng viên / Chủ lớp</option>
            <option value="STUDENT">Sinh viên đã duyệt</option>
            <option value="PENDING">Yêu cầu chờ duyệt</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Thành viên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tham gia</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredMembers.map((m) => {
                const isPending = m.status === 'PENDING';
                return (
                  <tr
                    key={m.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      isPending ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {m.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                            <span>{m.name}</span>
                            {m.studentCode && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {m.studentCode}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          m.role === 'OWNER'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            : m.role === 'TEACHER'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.role === 'OWNER'
                          ? 'Chủ lớp'
                          : m.role === 'TEACHER'
                          ? 'Giảng viên'
                          : 'Học viên'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Chờ duyệt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Đã tham gia
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {m.joinedAt || '01/09/2024'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isPending && currentRole === 'owner' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onApproveMember(m)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectMember(m)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

