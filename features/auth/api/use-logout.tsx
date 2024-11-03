import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.logout.$post>;
type RequestType = InferRequestType<typeof client.api.auth.logout.$post>;

export const useLogout = () => {
  const { toast } = useToast();
  const router = useRouter();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async () => {
      const response = await client.api.auth.logout.$post();

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (data.success) {
        toast({ variant: "success", description: data.message });
        window.location.href = "/";
      } else {
        toast({ variant: "destructive", description: data.message });
      }
    },
    onError: (error) => {
      console.log(error);
      toast({ variant: "destructive", description: error.message });
    },
  });
};
