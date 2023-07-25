"use client";

import { useState } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/TextArea";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/useCustomTaost";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment = ({ postId, replyToId }: CreateCommentProps) => {
  const [input, setinput] = useState<string>("");
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
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
      setinput("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your Comment</Label>
      <Textarea
        id="comment"
        value={input}
        placeholder="Write a comment"
        onChange={(e) => setinput(e.target.value)}
        rows={1}
      />
      <div className="mt-2 flex justify-end">
        <Button
          onClick={() => comment({ postId, text : input, replyToId })}
          isLoading={isLoading}
          disabled={input.length === 0}
        >
          Post
        </Button>
      </div>
    </div>
  );
};

export default CreateComment;
