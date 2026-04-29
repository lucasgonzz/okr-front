"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Comment } from "@/lib/types";
import { MessageSquare, Reply, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
}

function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
    <div className={cn("flex gap-3", depth > 0 && "ml-10 mt-3")}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
          {comment.author.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {comment.author.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-sm text-foreground/90">{comment.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            <Reply className="mr-1 h-3 w-3" />
            Reply
          </Button>
        </div>
        {showReplyInput && (
          <div className="mt-2 flex gap-2">
            <Textarea
              placeholder="Write a reply..."
              className="min-h-[60px] resize-none text-sm"
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" className="h-7 text-xs">Send</Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowReplyInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}

interface CommentsProps {
  comments: Comment[];
  className?: string;
}

export function Comments({ comments, className }: CommentsProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Comments ({comments.length})
          </h3>
        </div>
      </div>
      <div className="p-4">
        {/* Add new comment */}
        <div className="mb-4 flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">M</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              className="min-h-[80px] resize-none text-sm"
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm">Post Comment</Button>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
}
