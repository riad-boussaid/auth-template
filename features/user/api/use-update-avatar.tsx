import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.user.updateAvatar.$post
>;
type RequestType = InferRequestType<typeof client.api.user.updateAvatar.$post>;

export const useUpdateAvatar = () => {
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.user.updateAvatar.$post({ form });

      if (!response.ok) {
        throw new Error("Failed to update avater");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({ variant: "destructive", description: data.error });
      } else {
        toast({ variant: "success", description: data.message });
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
