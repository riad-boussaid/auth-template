import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<typeof client.api.user.updateRole.$post>;
type RequestType = InferRequestType<typeof client.api.user.updateRole.$post>;

export const useUpdateRole = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.user.updateRole.$post({ form });

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

        router.refresh();
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
