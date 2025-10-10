"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Clock,
  LogOut,
  Edit,
  Camera,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// TODO: 실제 API 연동 시 교체
const mockUserData = {
  id: 1,
  email: "user@example.com",
  nickname: "데브노기유저",
  profileImageUrl: null,
  status: "ACTIVE",
  role: "USER",
  createdAt: "2024-01-15T09:30:00",
  updatedAt: "2025-01-10T14:20:00",
  lastLoginAt: "2025-01-11T10:15:00",
};

export default function MyPage() {
  const [user] = useState(mockUserData);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      BANNED: "bg-red-100 text-red-800",
    };
    const labels = {
      ACTIVE: "활성",
      INACTIVE: "비활성",
      BANNED: "정지",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleLogout = () => {
    // TODO: 로그아웃 로직 구현
    console.log("로그아웃");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8">
        <div className="flex items-start gap-6">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                user.nickname[0]
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.nickname}
              </h1>
              {getStatusBadge(user.status)}
            </div>
            <p className="text-gray-600 flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 h-10"
              >
                <Edit className="w-4 h-4 mr-2" />
                프로필 수정
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-xl px-6 h-10 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">계정 정보</h2>
        <div className="space-y-4">
          <InfoRow
            icon={<User className="w-5 h-5 text-gray-400" />}
            label="회원 ID"
            value={`#${user.id}`}
          />
          <InfoRow
            icon={<Shield className="w-5 h-5 text-gray-400" />}
            label="권한"
            value={user.role === "USER" ? "일반 회원" : "관리자"}
          />
          <InfoRow
            icon={<Calendar className="w-5 h-5 text-gray-400" />}
            label="가입일"
            value={formatDate(user.createdAt)}
          />
          <InfoRow
            icon={<Clock className="w-5 h-5 text-gray-400" />}
            label="마지막 로그인"
            value={formatDate(user.lastLoginAt)}
          />
          <InfoRow
            icon={<Calendar className="w-5 h-5 text-gray-400" />}
            label="정보 수정일"
            value={formatDate(user.updatedAt)}
          />
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">보안 설정</h2>
        <div className="space-y-3">
          <ActionButton
            icon={<Key className="w-5 h-5" />}
            label="비밀번호 변경"
            description="정기적인 비밀번호 변경으로 계정을 안전하게 보호하세요"
            onClick={() => console.log("비밀번호 변경")}
          />
          <ActionButton
            icon={<Shield className="w-5 h-5" />}
            label="2단계 인증"
            description="추가 보안 계층으로 계정을 보호하세요"
            onClick={() => console.log("2단계 인증")}
            badge="준비중"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-3xl border border-red-200 p-8">
        <h2 className="text-lg font-bold text-red-900 mb-2">위험 구역</h2>
        <p className="text-sm text-red-700 mb-6">
          이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.
        </p>
        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100 rounded-xl"
          onClick={() => console.log("계정 삭제")}
        >
          계정 삭제
        </Button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

// InfoRow Component
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ActionButton Component
function ActionButton({
  icon,
  label,
  description,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors text-left group"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-gray-900">{label}</p>
          {badge && (
            <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}

// Edit Profile Modal
function EditProfileModal({
  user,
  onClose,
}: {
  user: typeof mockUserData;
  onClose: () => void;
}) {
  const [nickname, setNickname] = useState(user.nickname);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    // TODO: API 호출
    console.log("저장:", { nickname, email });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          프로필 수정
        </h2>

        <div className="space-y-5 mb-8">
          {/* Nickname */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="닉네임을 입력하세요"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이메일을 입력하세요"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-gray-300"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
