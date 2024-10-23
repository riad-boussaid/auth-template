import { useToast } from "@/hooks/use-toast";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferResponseType, InferRequestType } from "hono";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<
  typeof client.api.user.updateUsername.$post
>;
type RequestType = InferRequestType<
  typeof client.api.user.updateUsername.$post
>;

export const useUpdateUsername = () => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.user.updateUsername.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        toast({ variant: "success", description: data.message });
        queryClient.invalidateQueries({ queryKey: ["current"] });

        router.refresh();
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
