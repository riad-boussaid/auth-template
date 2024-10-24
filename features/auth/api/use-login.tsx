import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
// import { getErrorMessages } from "@/lib/error-message";

type ResponseType = InferResponseType<typeof client.api.auth.login.$post>;
type RequestType = InferRequestType<typeof client.api.auth.login.$post>;

export const useLogin = () => {
  const router = useRouter();
  const { toast } = useToast();
  // const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.auth.login.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({ variant: "destructive", description: data.message });

        if (data.message === "email_not_verified") {
          router.push(`/email-verification`);
        }
      } else {
        toast({ variant: "success", description: data.message });
        // queryClient.invalidateQueries({ queryKey: ["current"] });

        router.push("/");
        router.refresh();
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });

  return mutation;
};
