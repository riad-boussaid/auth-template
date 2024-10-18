import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export default async function Home() {
  return (
    <div className="container flex min-h-[calc(100dvh-80px)] items-center justify-center py-8">
      <Link
        href={"https://github.com/riad-boussaid/lucia-auth-template"}
        target="_blank"
      >
        <Button variant={"link"} size={"sm"}>
          <FaGithub className="size-4" />
          Github repo
        </Button>
      </Link>
    </div>
  );
}
