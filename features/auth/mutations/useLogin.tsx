import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
// import { useToast } from "@/hooks/use-toast";
// import { getErrorMessages } from "@/lib/error-message";

type ResponseType = InferResponseType<(typeof client.api.auth.login)["$post"]>;
type RequestType = InferRequestType<(typeof client.api.auth.login)["$post"]>;

export const useLogin = () => {
  //   const { toast } = useToast();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      return response.json();
    },
    // onSuccess: (data) => {
    //   if (data?.error) {
    //     toast({ variant: "destructive", description: data.error });

    //     // if (data?.key === "email_not_verified") {
    //     //   setShowResendVerificationEmail(true);
    //     // }
    //   }
    //   if (data?.success) {
    //     toast({ variant: "default", description: data.success });
    //   }
    // },
    // onError: (error) => {
    //   toast({ variant: "destructive", description: error.message });

    //   //   if (key === "email_not_verified") {
    //   //     setShowResendVerificationEmail(true);
    //   //   }
    // },
  });

  return mutation;
};
