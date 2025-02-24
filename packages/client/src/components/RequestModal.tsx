import type { EventResponseSent } from "@/types/proxy";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";
import { useState } from "react";

const requestSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]),
  url: z.string().url(),
  headers: z.record(z.string()),
  body: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EventResponseSent;
  onSend: (data: RequestFormData) => Promise<void>;
}

export const RequestModal = ({
  isOpen,
  onClose,
  request,
  onSend,
}: RequestModalProps) => {
  const [activeTab, setActiveTab] = useState<"headers" | "body">("headers");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      method: request.method.toUpperCase(),
      url: `${request.hostname}${request.path}`,
      headers: request.headers || {},
      body: request.body || "",
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    await onSend(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[800px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-32">
                    <Label>Method</Label>
                    <Select
                      defaultValue={request.method.toUpperCase()}
                      {...register("method")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "GET",
                          "POST",
                          "PUT",
                          "DELETE",
                          "PATCH",
                          "OPTIONS",
                        ].map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label>URL</Label>
                    <Input {...register("url")} />
                    {errors.url && (
                      <p className="text-sm text-red-500">
                        {errors.url.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 border-b border-gray-200">
                  <Button
                    variant={activeTab === "headers" ? "default" : "ghost"}
                    onClick={() => setActiveTab("headers")}
                    type="button"
                  >
                    Headers
                  </Button>
                  <Button
                    variant={activeTab === "body" ? "default" : "ghost"}
                    onClick={() => setActiveTab("body")}
                    type="button"
                  >
                    Body
                  </Button>
                </div>

                {activeTab === "headers" && (
                  <div className="space-y-2">
                    {Object.entries(request.headers || {}).map(
                      ([key, value], index) => (
                        <div key={index} className="grid grid-cols-2 gap-2">
                          <Input
                            {...register(`headers.${key}`)}
                            placeholder="Header name"
                            defaultValue={key}
                          />
                          <Input
                            {...register(`headers.${key}`)}
                            placeholder="Header value"
                            defaultValue={value as string}
                          />
                        </div>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Add new header logic
                      }}
                    >
                      Add Header
                    </Button>
                  </div>
                )}

                {activeTab === "body" && (
                  <div>
                    <Textarea
                      {...register("body")}
                      className="font-mono h-[300px]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit(onSubmit)}>Send Request</Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
