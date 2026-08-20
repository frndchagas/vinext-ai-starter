import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldProps extends React.ComponentProps<typeof Input> {
  label: string;
  name: string;
  errors?: string[] | undefined;
}

function Field({ label, name, errors, ...props }: FieldProps) {
  const hasErrors = errors !== undefined && errors.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} aria-invalid={hasErrors || undefined} {...props} />
      {hasErrors ? (
        <p role="alert" className="text-sm text-destructive">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

export { Field };
