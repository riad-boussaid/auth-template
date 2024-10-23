import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.auth.forgotPassword.$post
>;
type RequestType = InferRequestType<typeof client.api.auth.forgotPassword.$post>;

export const useForgotPassword = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.forgotPassword.$post({
        json,
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      // const token = "123456";
      const redirectUrl = `/password-reset/email-verification`;
      if (!data.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        router.push(`${redirectUrl}`);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });
};
