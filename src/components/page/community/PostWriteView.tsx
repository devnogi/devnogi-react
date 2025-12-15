"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  X,
  Hash,
  Smile,
  Globe,
  Lock,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type VisibilityOption = "public" | "followers" | "private";

interface ImagePreview {
  id: string;
  url: string;
  file: File;
}

export default function PostWriteView() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [visibility, setVisibility] = useState<VisibilityOption>("public");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState("자유게시판");
  const [showBoardMenu, setShowBoardMenu] = useState(false);

  const boardOptions = [
    "자유게시판",
    "공략게시판",
    "거래게시판",
    "질문게시판",
  ];

  const visibilityOptions = [
    { value: "public" as VisibilityOption, label: "전체 공개", icon: Globe },
    {
      value: "followers" as VisibilityOption,
      label: "팔로워 공개",
      icon: Users,
    },
    { value: "private" as VisibilityOption, label: "비공개", icon: Lock },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImagePreview[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...newImages].slice(0, 10)); // Max 10 images
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, "");
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    // TODO: Implement post submission
  };

  const currentVisibility = visibilityOptions.find(
    (opt) => opt.value === visibility,
  );
  const VisibilityIcon = currentVisibility?.icon || Globe;

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/community">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <X className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">새 게시글</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            게시하기
          </Button>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Board Selection */}
          <div className="mb-4 relative">
            <button
              onClick={() => setShowBoardMenu(!showBoardMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
                {selectedBoard}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {showBoardMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
                {boardOptions.map((board) => (
                  <button
                    key={board}
                    onClick={() => {
                      setSelectedBoard(board);
                      setShowBoardMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    {board}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title Input */}
          <input
            type="text"
            placeholder="제목을 입력하세요..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none mb-4 bg-transparent"
            maxLength={100}
          />

          {/* Content Textarea */}
          <textarea
            placeholder="무슨 일이 일어나고 있나요?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-gray-700 placeholder-gray-400 border-none outline-none resize-none bg-transparent min-h-[200px] leading-relaxed"
            maxLength={5000}
          />

          {/* Image Previews */}
          {images.length > 0 && (
            <div
              className={`grid gap-2 mt-4 ${
                images.length === 1
                  ? "grid-cols-1"
                  : images.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}
            >
              {images.map((image) => (
                <div key={image.id} className="relative group aspect-square">
                  <Image
                    src={image.url}
                    alt="Preview"
                    fill
                    className="object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleRemoveImage(image.id)}
                    className="absolute top-2 right-2 p-1.5 bg-gray-900 bg-opacity-70 hover:bg-opacity-90 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 rounded-full text-sm font-medium"
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Image Upload Button */}
              <label className="cursor-pointer p-2 hover:bg-blue-100 rounded-lg transition-colors group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={images.length >= 10}
                />
                <ImageIcon className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
              </label>

              {/* Tag Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="태그 추가..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={tags.length >= 10}
                  className="pl-3 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Emoji Button (placeholder) */}
              <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors group">
                <Smile className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
              </button>
            </div>

            {/* Visibility Selector */}
            <div className="relative">
              <button
                onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <VisibilityIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {currentVisibility?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showVisibilityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
                  {visibilityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setVisibility(option.value);
                          setShowVisibilityMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Character Count */}
          <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
            <span>
              {images.length > 0 && `${images.length}/10 이미지`}
              {tags.length > 0 &&
                ` • ${tags.length}/10 태그${images.length > 0 ? "" : ""}`}
            </span>
            <span className={content.length > 4500 ? "text-red-500" : ""}>
              {content.length} / 5000
            </span>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Smile className="w-5 h-5 text-blue-600" />
          게시글 작성 팁
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>최대 10개의 이미지를 첨부할 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>태그를 사용하여 게시글을 더 쉽게 찾을 수 있게 하세요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>공개 범위를 설정하여 원하는 사람들에게만 공개하세요.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
