import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<typeof client.api.user.delete.$post>;
type RequestType = InferRequestType<typeof client.api.user.delete.$post>;

export const useDeleteAcoount = () => {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.user.delete.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (!data.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        toast({ variant: "success", description: data.message });
        router.push("/");
        router.refresh();
      }
    },
    onError: (error) => {
      console.log(error);

      toast({ variant: "destructive", description: error.message });
    },
  });
};
