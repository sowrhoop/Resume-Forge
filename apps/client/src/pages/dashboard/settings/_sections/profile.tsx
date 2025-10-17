import { useTheme } from "@reactive-resume/hooks";
import { Combobox, FormItem, FormLabel } from "@reactive-resume/ui";

export const ProfileSettings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold leading-relaxed tracking-tight">{`Profile`}</h3>
        <p className="leading-relaxed opacity-75">{`Pick your preferred theme.`}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormItem>
          <FormLabel>{`Theme`}</FormLabel>
          <Combobox
            value={theme}
            options={[
              { label: `System`, value: "system" },
              { label: `Light`, value: "light" },
              { label: `Dark`, value: "dark" },
            ]}
            onValueChange={(value) => setTheme(value as "system" | "light" | "dark")}
          />
        </FormItem>
      </div>
    </div>
  );
};
