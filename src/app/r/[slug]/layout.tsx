import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

interface layoutProps {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}

const layout = async ({ children, params: { slug } }: layoutProps) => {
  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          vote: true,
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session?.user.id,
          },
        },
      });

  //   Cast any value to boolean (for self understanding)
  const isSubscribe = !!subscription;

  if (!subreddit) return notFound();

  const memebersCount = await db.subscription.count({
    where: {
      subredditId: subreddit.id,
    },
  });

  return (
    <div className="small-container max-w-7xl h-full pt-12">
      <div>
        {/* Button to take us back */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          {/* info sidebar */}

          <div className="hidden md:block overflow-hidden h-fit rounded-lg border-gray-200 order-first md:order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">About r/{slug}</p>
            </div>

            <dl className="divide-y divide-gray-100 px-6 py-4 texts-m leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit.createdAt.toDateString()}>
                    {format(subreddit.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Members</dt>
                <dd className="text-gray-900">{memebersCount}</dd>
              </div>

              {subreddit.createrId === session?.user.id ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <p className="text-gray-500">You Created this community</p>
                </div>
              ) : null}

              {subreddit.createrId !== session?.user.id ? (
                <SubscribeLeaveToggle
                  isSubscribe={isSubscribe}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              ) : null}

              <Link
                href={`r/${slug}/submit`}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full mb-6",
                })}
              >
                Create Post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
