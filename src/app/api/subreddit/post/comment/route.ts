import { z } from "zod";
import { CommentValidator } from "@/lib/validators/comment";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user)
      return new Response("Unauthorized Access", { status: 401 });

    const body = await req.json();

    const { postId, text, replyToId } = CommentValidator.parse(body);

    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Inavlid request data passed.", { status: 422 });
    }

    return new Response(
      "Could not comment at this time, please try again later.",
      {
        status: 500,
      }
    );
  }
}
