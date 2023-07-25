import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/Username";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session) return new Response("Unauthorized Access", { status: 401 });

    const body = await req.json();

    const { name } = UsernameValidator.parse(body);

    const usernameExistis = await db.user.findFirst({
      where: {
        username: name,
      },
    });

    if (usernameExistis)
      return new Response("Username is taken", { status: 409 });

    // update username
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Inavlid request data passed.", { status: 422 });
    }

    return new Response("Could not change username. Please try again.", {
      status: 500,
    });
  }
}
