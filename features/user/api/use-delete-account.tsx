import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.user.deleteAccount.$post
>;
type RequestType = InferRequestType<typeof client.api.user.deleteAccount.$post>;

export const useDeleteAccount = () => {
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.user.deleteAccount.$post({ form });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (!data.success) {
        toast({ variant: "destructive", description: data.error });
      } else {
        toast({ variant: "success", description: data.message });
        // router.push("/");
        // router.refresh();
      }
    },
    onError: (error) => {
      console.log(error);

      toast({ variant: "destructive", description: error.message });
    },
  });
};
