import { zodResolver } from "@hookform/resolvers/zod";
import { awardSchema, defaultAward } from "@reactive-resume/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RichInput,
} from "@reactive-resume/ui";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { AiActions } from "@/client/components/ai-actions";

import { SectionDialog } from "../sections/shared/section-dialog";
import { URLInput } from "../sections/shared/url-input";

const formSchema = awardSchema;

type FormValues = z.infer<typeof formSchema>;

export const AwardsDialog = () => {
  const form = useForm<FormValues>({
    defaultValues: defaultAward,
    resolver: zodResolver(formSchema),
  });

  return (
    <SectionDialog<FormValues> id="awards" form={form} defaultValues={defaultAward}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"Title"}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="awarder"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`Awarder`}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`Date`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={"March 2023"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="url"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{`Website`}</FormLabel>
              <FormControl>
                <URLInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="summary"
          control={form.control}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{`Summary`}</FormLabel>
              <FormControl>
                <RichInput
                  {...field}
                  content={field.value}
                  footer={(editor) => (
                    <AiActions
                      value={editor.getText()}
                      onChange={(value) => {
                        editor.commands.setContent(value, true);
                        field.onChange(value);
                      }}
                    />
                  )}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </SectionDialog>
  );
};
