import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg">페이지를 찾을 수 없습니다.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
