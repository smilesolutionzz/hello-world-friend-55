import React from 'react';
import { CATEGORY_AXES, type CategoryAxis } from '@/lib/mindTrackCategories';
import { cn } from '@/lib/utils';

interface TrackCategoryChipsProps {
  axis: CategoryAxis;
  selectedTags: string[];
  onAxisChange: (axis: CategoryAxis) => void;
  onTagsChange: (tags: string[]) => void;
}

/**
 * 4축 카테고리 칩 — 한 번에 한 축만 활성, 그 안에서 다중 선택
 * 메모리 정책: 흰 배경 + rounded-2xl, 그라데이션/이모지 없음
 */
const TrackCategoryChips: React.FC<TrackCategoryChipsProps> = ({
  axis,
  selectedTags,
  onAxisChange,
  onTagsChange,
}) => {
  const currentAxis = CATEGORY_AXES.find((a) => a.id === axis) ?? CATEGORY_AXES[0];

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((t) => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="space-y-3">
      {/* 축 선택 — 라디오형 */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORY_AXES.map((a) => {
          const active = a.id === axis;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                onAxisChange(a.id);
                onTagsChange([]);
              }}
              className={cn(
                'shrink-0 px-4 h-9 rounded-full text-sm font-medium border transition-all',
                active
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {/* 태그 선택 — 다중 */}
      <div className="flex flex-wrap gap-2">
        {currentAxis.tags.map((tag) => {
          const active = selectedTags.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              disabled={tag.comingSoon}
              onClick={() => toggleTag(tag.id)}
              className={cn(
                'px-3 h-8 rounded-full text-xs font-medium border transition-all inline-flex items-center gap-1.5',
                tag.comingSoon
                  ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                  : active
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  active ? 'bg-blue-500' : 'bg-slate-300'
                )}
              />
              {tag.label}
              {tag.comingSoon && <span className="text-[10px] opacity-70">곧 공개</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrackCategoryChips;
