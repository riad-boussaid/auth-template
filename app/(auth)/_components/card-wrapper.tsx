"use client";

import { BackButton } from "../_components/back-button";
import { Social } from "../_components/social";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface CardWrapperProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerLabel?: string;
  backButtonLabel?: string;
  backButtonHref: string;
  showSocial?: boolean;
  showFooter?: boolean;
}

export const CardWrapper = ({
  children,
  headerTitle,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
  showFooter = true,
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <div className="flex w-full flex-col items-center justify-center gap-y-4">
          <h1 className={"text-3xl font-semibold"}>{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">{headerLabel}</p>
        </div>
      </CardHeader>

      <CardContent>
        {showSocial && (
          <div>
            <Social />
          </div>
        )}
        {children}
      </CardContent>

      {backButtonLabel && (
        <CardFooter>
          <BackButton label={backButtonLabel} href={backButtonHref} />
        </CardFooter>
      )}

      {showFooter && (
        <CardFooter>
          <p className="text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
