import axios from "axios";

// api end point editor js will call and in response. It will get metadata about the link

export async function GET(req: Request) {
  const url = new URL(req.url);
  const href = url.searchParams.get("url");

  if (!href) {
    return new Response("Inavlid href", { status: 400 });
  }

  const res = await axios.get(href);

  const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : "";

  const descriptionMatch = res.data.match(
    /<meta name="description'"content="(.*?)"/
  );
  const description = descriptionMatch ? descriptionMatch : "";

  const imageMatch = res.data.match(
    /<meta property="og:image" content="(.*?)"/
  );
  const imageUrl = imageMatch ? imageMatch : "";

  return new Response(
    JSON.stringify({
      success: 1,
      meta: {
        title,
        description,
        image: {
          url: imageUrl,
        },
      },
    })
  );
}
