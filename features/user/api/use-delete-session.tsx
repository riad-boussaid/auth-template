import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.user.deleteSession.$post,
  200
>;
type RequesteType = InferRequestType<
  typeof client.api.user.deleteSession.$post
>;

export const useDeleteSession = () => {
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequesteType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.user.deleteSession.$post({ form });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast({ variant: "success", description: data.message });
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
