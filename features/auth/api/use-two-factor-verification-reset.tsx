import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
// import { getErrorMessages } from "@/lib/error-message";

import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.auth.twoFactorVerificationReset.$post
>;
type RequestType = InferRequestType<
  typeof client.api.auth.twoFactorVerificationReset.$post
>;

export const useTwoFactorVerificationReset = () => {
  const router = useRouter();
  const { toast } = useToast();
  // const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.auth.twoFactorVerificationReset.$post({
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
        router.push(`/2fa/setup`);
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
