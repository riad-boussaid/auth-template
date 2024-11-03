"use client";

import { formatRelative } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useSession } from "@/components/providers/session-provider";

import { Session } from "@/lib/db/schema";

export const SessionsForm = ({ sessions }: { sessions?: Session[] }) => {
  const { session: currentSession } = useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>This is all of your sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions?.map((session, index) => {
          return (
            <div key={session.id} className="flex justify-between gap-x-2">
              {currentSession?.id === session.id ? (
                <>
                  <h2>Session {index + 1}</h2>
                  <h1>current session</h1>
                  <p className="text-sm">
                    <span>{formatRelative(session.createdAt, new Date())}</span>
                  </p>
                </>
              ) : (
                <>
                  <h2>Session {index + 1}</h2>
                  <p className="text-sm">
                    <span>{formatRelative(session.createdAt, new Date())}</span>
                  </p>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
