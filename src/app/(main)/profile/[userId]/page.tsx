import { AxiosError } from "axios";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProfileActivityFeed from "@/components/profile/ProfileActivityFeed";
import PublicProfileHeader from "@/components/profile/PublicProfileHeader";
import { USER_ENDPOINT } from "@/lib/api/constants";
import { createPublicAuthServerAxios } from "@/lib/api/server";
import type { PublicUserProfile } from "@/types/profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "사용자 프로필",
  robots: { index: false, follow: false },
};

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

interface ApiResponse<T> {
  data: T;
}

async function getProfile(userId: number): Promise<PublicUserProfile> {
  try {
    const axios = createPublicAuthServerAxios();
    const response = await axios.get<ApiResponse<PublicUserProfile>>(
      `${USER_ENDPOINT}/public/${userId}/profile`,
    );
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId: rawUserId } = await params;
  const userId = Number(rawUserId);
  if (!Number.isSafeInteger(userId) || userId <= 0) notFound();
  const profile = await getProfile(userId);

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <PublicProfileHeader profile={profile} />
      <ProfileActivityFeed userId={profile.userId} />
    </div>
  );
}
