import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
// import { getErrorMessages } from "@/lib/error-message";

type ResponseType = InferResponseType<
  typeof client.api.auth.twoFactorVerificationSetup.$post
>;
type RequestType = InferRequestType<
  typeof client.api.auth.twoFactorVerificationSetup.$post
>;

export const useTwoFactorVerificationSetup = () => {
  const router = useRouter();
  const { toast } = useToast();
  // const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.auth.twoFactorVerificationSetup.$post({
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
        router.push(`/recovery-code`);
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });
};
