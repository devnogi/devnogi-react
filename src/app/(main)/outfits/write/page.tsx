import { OutfitAuth } from "@/components/page/outfits/OutfitAuth";
import OutfitComposer from "@/components/page/outfits/OutfitComposer";
export const metadata = {
  title: "의장 올리기",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <OutfitAuth>
      <OutfitComposer />
    </OutfitAuth>
  );
}
