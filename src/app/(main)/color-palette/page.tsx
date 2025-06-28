import { themeColors, colorCategories } from '@/lib/theme';

export default function ColorPalettePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">프로젝트 테마 색상</h1>
      
      <div className="space-y-12">
        {/* 기본 색상 */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">기본 색상</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(colorCategories.neutral).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-20 h-20 rounded-lg border border-gray-300 shadow-sm mx-auto mb-3"
                  style={{ backgroundColor: color }}
                />
                <p className="font-medium">{name}</p>
                <p className="text-sm text-gray-600">{color}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 주요 색상 */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">주요 색상</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(colorCategories.primary).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-20 h-20 rounded-lg border border-gray-300 shadow-sm mx-auto mb-3"
                  style={{ backgroundColor: color }}
                />
                <p className="font-medium">{name}</p>
                <p className="text-sm text-gray-600">{color}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 확장 색상 */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">확장 색상</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Object.entries(colorCategories.accent).map(([name, color]) => (
              <div key={name} className="text-center">
                <div 
                  className="w-20 h-20 rounded-lg border border-gray-300 shadow-sm mx-auto mb-3"
                  style={{ backgroundColor: color }}
                />
                <p className="font-medium">{name}</p>
                <p className="text-sm text-gray-600">{color}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 사용 방법 */}
        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">사용 방법</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">CSS 클래스</h3>
              <div className="bg-white p-3 rounded border">
                <code className="text-sm">
                  &lt;div className=&quot;text-theme-blue bg-theme-red&quot;&gt;
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">CSS 변수</h3>
              <div className="bg-white p-3 rounded border">
                <code className="text-sm">
                  color: var(--color-blue);<br />
                  background-color: var(--color-red);
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">TypeScript</h3>
              <div className="bg-white p-3 rounded border">
                <code className="text-sm">
                  import {'{'} themeColors {'}'} from &apos;@/lib/theme&apos;;<br />
                  const buttonColor = themeColors.blue;
                </code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 