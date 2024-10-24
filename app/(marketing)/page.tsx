import { FaGithub } from "react-icons/fa";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  return (
    <div className="container flex min-h-[calc(100dvh-80px)] items-center justify-center gap-x-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Tech Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="mt-4 space-y-1 *:text-xs">
            <li>- Next.js</li>
            <li>- Hono</li>
            <li>- Tanstack query</li>
            <li>- Zod</li>
            <li>- React Hook Form</li>
            <li>- Drizzle Orm</li>
            <li>- Node Mailer</li>
          </ul>
        </CardContent>
        <CardFooter className="justify-end border-t p-6">
          <div>
            <Link
              href={"https://github.com/riad-boussaid/lucia-auth-template"}
              target="_blank"
            >
              <Button variant={"default"} size={"sm"}>
                <FaGithub className="size-4" />
                Github repo
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
