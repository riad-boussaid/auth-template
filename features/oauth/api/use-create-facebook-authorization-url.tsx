import { InferResponseType, InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { useToast } from "@/hooks/use-toast";

type ResponseType = InferResponseType<
  typeof client.api.oauth.createFacebookAuthorizationUrl.$get
>;
type RequesteType = InferRequestType<
  typeof client.api.oauth.createFacebookAuthorizationUrl.$get
>;

export const useCreateFacebookAuthorizationUrl = () => {
  const { toast } = useToast();

  return useMutation<ResponseType, Error, RequesteType>({
    mutationFn: async () => {
      const response =
        await client.api.oauth.createFacebookAuthorizationUrl.$get();

      if (!response) {
        throw new Error("Failed to create facebook authorization url");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      console.log(data);

      if (!data.success) {
        toast({ variant: "destructive", description: data.error });
      } else {
        // toast({ variant: "success", description: data.message });
        window.location.href = data.data.authorizationUrl;
      }
    },
  });
};
