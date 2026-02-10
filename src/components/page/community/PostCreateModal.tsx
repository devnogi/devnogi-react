"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  X,
  Hash,
  Smile,
  Globe,
  Lock,
  Users,
  ChevronDown,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { clientAxios } from "@/lib/api/clients";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Board, ApiResponse, BoardListData } from "@/types/community";

type VisibilityOption = "public" | "followers" | "private";

interface ImagePreview {
  id: string;
  url: string;
  file: File;
}

interface PostCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostCreateModal({
  isOpen,
  onClose,
}: PostCreateModalProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [visibility, setVisibility] = useState<VisibilityOption>("public");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boardOptions, setBoardOptions] = useState<Board[]>([]);

  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch("/api/boards");
      if (!response.ok) return;
      const apiResponse: ApiResponse<BoardListData> = await response.json();
      if (!apiResponse.success) return;
      const boards = apiResponse.data?.boards || [];
      setBoardOptions(boards);
      if (boards.length > 0 && selectedBoardId === null) {
        setSelectedBoardId(boards[0].id);
      }
    } catch {
      // 게시판 목록 로드 실패 시 무시
    }
  }, [selectedBoardId]);

  useEffect(() => {
    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen, fetchBoards]);

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

    setImages((prev) => [...prev, ...newImages].slice(0, 10));
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

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.warning("로그인 후 사용 가능합니다.");
      return;
    }

    if (!title.trim()) {
      toast.warning("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      toast.warning("내용을 입력해주세요.");
      return;
    }

    const selectedBoardData = boardOptions.find((b) => b.id === selectedBoardId);
    if (!selectedBoardData) {
      toast.error("게시판을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      const postData = {
        boardId: selectedBoardData.id,
        title: title.trim(),
        content: content.trim(),
      };
      formData.append(
        "data",
        new Blob([JSON.stringify(postData)], { type: "application/json" })
      );

      images.forEach((image) => {
        formData.append("files", image.file);
      });

      await clientAxios.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("게시글이 작성되었습니다.");
      resetForm();
      onClose();
      router.push("/community");
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImages([]);
    setTags([]);
    setTagInput("");
    setIsExpanded(false);
  };

  const handleClose = () => {
    const hasContent = title.trim() || content.trim() || images.length > 0 || tags.length > 0;

    if (hasContent) {
      const confirmed = window.confirm(
        "작성 중인 내용이 있습니다. 정말로 나가시겠습니까?\n작성한 내용은 저장되지 않습니다.",
      );
      if (!confirmed) return;
    }

    resetForm();
    onClose();
  };

  const currentVisibility = visibilityOptions.find(
    (opt) => opt.value === visibility,
  );
  const VisibilityIcon = currentVisibility?.icon || Globe;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with subtle opacity */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={!isExpanded ? handleClose : undefined}
          />

          {/* Modal Content */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className={`fixed z-50 overflow-hidden ${
              isExpanded
                ? "inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl max-h-[85vh] bg-white shadow-2xl border border-gray-100"
            }`}
            style={!isExpanded ? { borderRadius: "32px" } : undefined}
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <motion.div
                layout="position"
                className={`flex-shrink-0 border-b border-gray-100 ${
                  isExpanded
                    ? "bg-white/80 backdrop-blur-sm border-gray-200 w-full"
                    : "bg-gradient-to-r from-blue-50 to-purple-50"
                }`}
              >
                <div
                  className={`flex items-center justify-between px-6 py-4 ${
                    isExpanded ? "max-w-4xl mx-auto w-full" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-gray-600 hover:bg-white/50"
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-5 h-5" />
                      ) : (
                        <Maximize2 className="w-5 h-5" />
                      )}
                    </Button>
                    <h2 className="text-xl font-bold text-gray-900">
                      새 게시글
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={!title.trim() || !content.trim() || isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          게시 중...
                        </>
                      ) : (
                        "게시하기"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Content Area - Scrollable */}
              <motion.div layout="position" className="flex-1 overflow-y-auto">
                <div
                  className={`px-6 py-8 ${isExpanded ? "max-w-3xl mx-auto" : ""}`}
                >
                  {/* Board Selection */}
                  <motion.div layout className="mb-6 relative">
                    <button
                      onClick={() => setShowBoardMenu(!showBoardMenu)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isExpanded
                          ? "bg-white hover:bg-gray-50 shadow-sm border border-gray-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {boardOptions.find((b) => b.id === selectedBoardId)?.name || "게시판 선택"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                    <AnimatePresence>
                      {showBoardMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]"
                        >
                          {boardOptions.map((board) => (
                            <button
                              key={board.id}
                              onClick={() => {
                                setSelectedBoardId(board.id);
                                setShowBoardMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                            >
                              {board.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

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
                  <motion.textarea
                    layout
                    placeholder="무슨 일이 일어나고 있나요?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full text-gray-700 placeholder-gray-400 border-none outline-none resize-none bg-transparent leading-relaxed ${
                      isExpanded
                        ? "min-h-[500px] text-lg"
                        : "min-h-[200px] text-base"
                    }`}
                    maxLength={5000}
                    autoFocus={isExpanded}
                  />

                  {/* Image Previews */}
                  <AnimatePresence>
                    {images.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`grid gap-3 mt-6 ${
                          images.length === 1
                            ? "grid-cols-1"
                            : images.length === 2
                              ? "grid-cols-2"
                              : "grid-cols-3"
                        }`}
                      >
                        {images.map((image) => (
                          <motion.div
                            key={image.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="relative group aspect-square"
                          >
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
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tags */}
                  <AnimatePresence>
                    {tags.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-wrap gap-2 mt-6"
                      >
                        {tags.map((tag) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
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
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Footer Actions */}
              <motion.div
                layout="position"
                className={`flex-shrink-0 border-t border-gray-100 ${
                  isExpanded
                    ? "bg-white/80 backdrop-blur-sm border-gray-200 w-full"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`px-6 py-4 ${isExpanded ? "max-w-3xl mx-auto w-full" : ""}`}
                >
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

                      {/* Emoji Button */}
                      <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors group">
                        <Smile className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
                      </button>
                    </div>

                    {/* Visibility Selector */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowVisibilityMenu(!showVisibilityMenu)
                        }
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <VisibilityIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {currentVisibility?.label}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>
                      <AnimatePresence>
                        {showVisibilityMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]"
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Character Count */}
                  <motion.div
                    layout
                    className="mt-3 flex justify-between items-center text-xs text-gray-500"
                  >
                    <span>
                      {images.length > 0 && `${images.length}/10 이미지`}
                      {tags.length > 0 &&
                        ` • ${tags.length}/10 태그${images.length > 0 ? "" : ""}`}
                    </span>
                    <span
                      className={content.length > 4500 ? "text-red-500" : ""}
                    >
                      {content.length} / 5000
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
