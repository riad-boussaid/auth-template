import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
// import { getErrorMessages } from "@/lib/error-message";

type ResponseType = InferResponseType<
  typeof client.api.auth.twoFactorVerification.$post
>;
type RequestType = InferRequestType<
  typeof client.api.auth.twoFactorVerification.$post
>;

export const useTwoFactorVerification = () => {
  const router = useRouter();
  const { toast } = useToast();
  // const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.auth.twoFactorVerification.$post({
        form,
      });

      if (!response.ok) {
        throw new Error("Failed to redirect");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (!data.success) {
        toast({ variant: "destructive", description: data.error });
      } else {
        toast({
          variant: "success",
          description: data.message,
        });
        // queryClient.invalidateQueries({ queryKey: ["current"] });
        router.push(`/`);
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
