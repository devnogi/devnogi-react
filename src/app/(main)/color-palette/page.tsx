export default function ColorPalettePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">컬러 팔레트 (클래스 기반)</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary text-primary-foreground p-4 rounded">primary</div>
        <div className="bg-secondary text-secondary-foreground p-4 rounded">secondary</div>
        <div className="bg-accent text-accent-foreground p-4 rounded">accent</div>
        <div className="bg-muted text-muted-foreground p-4 rounded">muted</div>
        <div className="bg-destructive text-destructive-foreground p-4 rounded">destructive</div>
        <div className="bg-card text-card-foreground p-4 rounded">card</div>
        <div className="bg-popover text-popover-foreground p-4 rounded">popover</div>
        <div className="bg-border text-foreground p-4 rounded border border-border">border</div>
      </div>
      <p className="mt-8 text-gray-500 text-sm">* 이 페이지는 tailwind.config의 theme 확장 및 클래스 기반 스타일링 예시만을 제공합니다.</p>
    </div>
  );
} 