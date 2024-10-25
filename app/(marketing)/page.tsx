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
    <div className="flex h-full items-center">
      <Card className="w-[400px]">
        <CardHeader className="border-b">
          <div className="flex justify-between gap-x-2">
            <CardTitle className="text-2xl">Tech Stack</CardTitle>
            <Link
              href={"https://github.com/riad-boussaid/lucia-auth-template"}
              target="_blank"
            >
              <Button
                variant={"secondary"}
                size={"default"}
                className="rounded-full"
              >
                <FaGithub className="size-4" />
                Github repo
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="mt-4 space-y-1 *:text-sm">
            <li>- Next.js</li>
            <li>- Hono</li>
            <li>- Tanstack query</li>
            <li>- Zod</li>
            <li>- React Hook Form</li>
            <li>- Drizzle Orm</li>
            <li>- Node Mailer</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
