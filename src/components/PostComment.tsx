"use client";

import { formatTimeToNow } from "@/lib/utils";
import { Comment, CommentVote, User } from "@prisma/client";
import { useRef, useState } from "react";
import CommentVotes from "./CommentVotes";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/TextArea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: Pick<CommentVote, "type"> | undefined;
  postId: string;
}

const PostComment = ({ comment, votesAmt, currentVote }: PostCommentProps) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const router = useRouter();

  const { data: session } = useSession();

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );

      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong. Please try agian.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
      setIsReplying(false);
    },
  });

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 my-4">{comment.text}</p>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex gap-2 w-full">
          <CommentVotes
            commentId={comment.id}
            initialVotesAmt={votesAmt}
            initialVote={currentVote}
          />

          <Button
            onClick={() => {
              if (!session) return router.push("/sign-in");
              setIsReplying(true);
            }}
            variant="ghost"
            size="xs"
          >
            Reply <MessageSquare className="h-4 w-4 mr-1.5" />{" "}
          </Button>
        </div>

        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your Comment</Label>
            <Textarea
              id="comment"
              value={input}
              placeholder="Write a comment"
              onChange={(e) => setInput(e.target.value)}
              rows={1}
            />
            <div className="mt-2 flex gap-2 justify-end">
              <Button
                tabIndex={-1}
                variant="subtle"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!input) return;
                  postComment({
                    postId: comment.postId,
                    text: input,
                    replyToId: comment.replyToId ?? comment.id,
                  });
                }}
                isLoading={isLoading}
                disabled={input.length === 0}
              >
                Post
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
function loginToast(): unknown {
  throw new Error("Function not implemented.");
}
