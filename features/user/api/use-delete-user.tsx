import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<typeof client.api.user.deleteUser.$post>;
type RequestType = InferRequestType<typeof client.api.user.deleteUser.$post>;

export const useDeleteUser = () => {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.user.deleteUser.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to delete user");
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
