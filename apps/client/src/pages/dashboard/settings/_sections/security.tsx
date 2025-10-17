import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@reactive-resume/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "@/client/hooks/use-toast";
import { useUpdatePassword } from "@/client/services/auth";

const formSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

type FormValues = z.infer<typeof formSchema>;

export const SecuritySettings = () => {
  const { toast } = useToast();
  const { updatePassword, loading } = useUpdatePassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onReset = () => {
    form.reset({ currentPassword: "", newPassword: "" });
  };

  const onSubmit = async (data: FormValues) => {
    await updatePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    toast({
      variant: "success",
      title: `Your password has been updated successfully.`,
    });

    onReset();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold leading-relaxed tracking-tight">{`Security`}</h3>
        <p className="leading-relaxed opacity-75">{`Update your password to keep your account secure.`}</p>
      </div>

      <Form {...form}>
        <form className="grid gap-6 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="currentPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`Current Password`}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="newPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`New Password`}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence presenceAffectsLayout>
            {form.formState.isDirty && (
              <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center space-x-2 self-center sm:col-start-2"
              >
                <Button type="submit" disabled={loading}>
                  {`Change Password`}
                </Button>
                <Button type="reset" variant="ghost" onClick={onReset}>
                  {`Discard`}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </div>
  );
};
