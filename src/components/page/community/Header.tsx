import { Button } from "@/components/ui/button";
import Image from "next/image";

function Header() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Image
        src="/images/icons/icon-96x96.png"
        alt="Community Icon"
        width={64}
        height={64}
        className="rounded-full"
      />
      <div className="flex-1">
        <h2 className="text-2xl font-bold">커뮤니티</h2>
        <p className="text-gray-500">자유롭게 이야기를 나눠보세요.</p>
      </div>
      <Button>글쓰기</Button>
    </div>
  );
}

export default Header;
