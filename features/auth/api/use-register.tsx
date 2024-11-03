import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
// import { getErrorMessages } from "@/lib/error-message";

type ResponseType = InferResponseType<typeof client.api.auth.register.$post>;
type RequestType = InferRequestType<typeof client.api.auth.register.$post>;

export const useRegister = () => {
  const router = useRouter();
  const { toast } = useToast();
  // const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.auth.register.$post({ form });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (!data?.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        toast({
          variant: "success",
          description: data.message,
        });

        // queryClient.invalidateQueries({ queryKey: ["current"] });
        router.push(`/email-verification`);
      }
    },
    onError: (error) => {
      toast({ variant: "destructive", description: error.message });
    },
  });

  return mutation;
};
