import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
// import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  (typeof client.api.auth.resendEmailVerification)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.auth.resendEmailVerification)["$post"]
>;

export const useResendEmailVerification = () => {
//   const router = useRouter();
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async () => {
      const response = await client.api.auth.resendEmailVerification["$post"](
        {},
      );

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
        toast({ variant: "success", description: data.message });

        // router.push("/");
        // router.refresh();
      }
    },
    onError: (error) => {
      console.error(error);
      toast({ variant: "destructive", description: error.message });
    },
  });
};
