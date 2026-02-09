"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { clientAxios } from "@/lib/api/clients";
import { toast } from "sonner";

const REPORT_CATEGORIES = [
  { value: "SPAM", label: "스팸/도배" },
  { value: "ABUSE", label: "욕설/비방" },
  { value: "ADULT", label: "음란물" },
  { value: "VIOLENCE", label: "폭력적 콘텐츠" },
  { value: "FRAUD", label: "사기/허위정보" },
  { value: "COPYRIGHT", label: "저작권 침해" },
  { value: "PRIVACY", label: "개인정보 노출" },
  { value: "ILLEGAL", label: "불법 콘텐츠" },
  { value: "ADVERTISEMENT", label: "광고" },
  { value: "OTHER", label: "기타" },
] as const;

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "POST" | "COMMENT";
  targetId: number;
  targetUserId: number;
}

export default function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetUserId,
}: ReportDialogProps) {
  const [categoryCd, setCategoryCd] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = categoryCd && reason.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await clientAxios.post("/reports", {
        targetType,
        targetId,
        targetUserId,
        categoryCd,
        reason: reason.trim(),
      });
      toast.success("신고가 접수되었습니다.");
      handleClose();
    } catch {
      toast.error("신고 접수에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCategoryCd("");
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>신고하기</DialogTitle>
          <DialogDescription>
            {targetType === "POST" ? "게시글" : "댓글"}을 신고합니다. 신고
            사유를 선택하고 상세 내용을 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">신고 카테고리</label>
            <Select value={categoryCd} onValueChange={setCategoryCd}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">신고 사유</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="신고 사유를 입력해주세요 (최소 10자)"
              rows={4}
              disabled={isSubmitting}
            />
            {reason.length > 0 && reason.trim().length < 10 && (
              <p className="text-xs text-destructive">
                최소 10자 이상 입력해주세요. ({reason.trim().length}/10)
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            variant="destructive"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                신고 중...
              </>
            ) : (
              "신고하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
