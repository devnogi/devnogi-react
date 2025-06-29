'use client';

import { PostCategory, PostSortOption } from '@/types/post';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostListFiltersProps {
  category: PostCategory;
  sort: PostSortOption;
  ratingCut?: number;
  isBestOnly: boolean;
  onCategoryChange: (category: PostCategory) => void;
  onSortChange: (sort: PostSortOption) => void;
  onRatingCutChange: (ratingCut?: number) => void;
  onBestOnlyToggle: () => void;
  className?: string;
}

const categories: { value: PostCategory; label: string; icon?: string }[] = [
  { value: '전체', label: '전체' },
  { value: '공지', label: '🚨챈공지' },
  { value: '질문', label: '질❓️문' },
  { value: '공식', label: '공식' },
  { value: '도움요청', label: '⚠️도움요청' },
  { value: '나눔&대여', label: '나눔&대여' },
  { value: '나눔인증', label: '나눔인증' },
  { value: '연재', label: '연재' },
  { value: '토론', label: '토론' },
  { value: '유출', label: '유출(클뜯)' },
  { value: '자랑', label: '자랑' },
  { value: '창작', label: '🎨창작' },
  { value: '악보', label: '악보' },
  { value: '의장', label: '의장' },
  { value: '대회', label: '🏆대회' },
  { value: '건의', label: '건의' },
  { value: '저격', label: '저격' },
  { value: '기부', label: '기부' },
  { value: '운영용', label: '운영용' },
];

const sortOptions: { value: PostSortOption; label: string }[] = [
  { value: 'latest', label: '등록순' },
  { value: 'rating', label: '추천순 (24시간)' },
  { value: 'rating72', label: '추천순 (3일)' },
  { value: 'ratingAll', label: '추천순 (전체)' },
  { value: 'commentCount', label: '댓글갯수순 (3일)' },
  { value: 'recentComment', label: '최근댓글순' },
];

const ratingCutOptions = [
  { value: 'none', label: '추천컷' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '30', label: '30' },
  { value: '50', label: '50' },
  { value: '70', label: '70' },
  { value: '100', label: '100' },
  { value: 'etc', label: '기타' },
];

export const PostListFilters = ({
  category,
  sort,
  ratingCut,
  isBestOnly,
  onCategoryChange,
  onSortChange,
  onRatingCutChange,
  onBestOnlyToggle,
  className,
}: PostListFiltersProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* 카테고리 탭 */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                'whitespace-nowrap rounded-none border-b-2 px-3 py-2',
                category === cat.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 필터 옵션들 */}
      <div className="flex flex-wrap items-center gap-4">
        {/* 전체글/개념글 토글 */}
        <div className="flex items-center gap-2">
          <Button
            variant={!isBestOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => !isBestOnly || onBestOnlyToggle()}
            className="flex items-center gap-1"
          >
            <span>전체글</span>
          </Button>
          <Button
            variant={isBestOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => isBestOnly || onBestOnlyToggle()}
            className="flex items-center gap-1"
          >
            <span>개념글</span>
          </Button>
        </div>

        {/* 정렬 옵션 */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as PostSortOption)}
          className="w-48 h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* 추천컷 필터 */}
        <select
          value={ratingCut?.toString() || 'none'}
          onChange={(e) => onRatingCutChange(e.target.value === 'none' ? undefined : parseInt(e.target.value))}
          className="w-32 h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {ratingCutOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}; 