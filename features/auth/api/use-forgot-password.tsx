import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.auth.passwordReset.$post
>;
type RequestType = InferRequestType<typeof client.api.auth.passwordReset.$post>;

export const useForgotPassword = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.passwordReset.$post({
        json,
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (!data.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        router.push(`/reset-password?email=${data.message}`);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });
};
