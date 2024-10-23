import { useMutation } from "@tanstack/react-query";
import { InferResponseType, InferRequestType } from "hono";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { client } from "@/lib/rpc";

// const $post = client.api.user.resetPassword.$post;

type ResponseType = InferResponseType<
  typeof client.api.user.updatePassword.$post
>;
type RequestType = InferRequestType<typeof client.api.user.updatePassword.$post>;

export const useResetPassword = () => {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.user.updatePassword.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        toast({ variant: "success", description: data.message });
        router.refresh();
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
