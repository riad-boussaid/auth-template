import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.oauth.createGoogleAuthorizationURL.$get,
  200
>;
type RequesteType = InferRequestType<
  typeof client.api.oauth.createGoogleAuthorizationURL.$get
>;

export const useCreateGoogleAuthorizationUrl = () => {
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequesteType>({
    mutationFn: async () => {
      const response =
        await client.api.oauth.createGoogleAuthorizationURL.$get();

      if (!response) {
        throw new Error("Failed to create google authorization url");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (!data.success) {
        toast({ variant: "destructive", description: data.message });
      } else {
        toast({ variant: "success", description: data.message });
        window.location.href = data.data;
      }
    },
  });
};
