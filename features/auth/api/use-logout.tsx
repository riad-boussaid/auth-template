import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<typeof client.api.auth.logout.$post>;
type RequestType = InferRequestType<typeof client.api.auth.logout.$post>;

export const useLogout = () => {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.logout.$post({ json });

      // if (!response.ok) {
      //   throw new Error("Failed to logout");
      // }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (!data.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        router.push("/");
        router.refresh();
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });
};
