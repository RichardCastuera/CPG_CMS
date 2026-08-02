"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(160, "Title must be at most 160 characters."),
  guideline_type: z.enum(["Compendium", "Interim"]),
  status: z.enum(["draft", "in_review", "published", "archived"]).optional(),
  publishingSocieties: z.string().min(1, "Enter at least one society."),
  specialtyTags: z.string().min(1, "Enter at least one topic."),
  version_number: z.string().min(1, "Enter a version number, e.g. v1.0."),
  effective_date: z.string().min(1, "Select an effective date."),
  authors: z.array(
    z.object({
      name: z.string().min(1, "Name is required."),
      position: z.string().min(1, "Position is required."),
      affiliation: z.string().optional(),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateGuidelineFormProps {
  onCancel?: () => void;
}

export function CreateGuidelineForm({ onCancel }: CreateGuidelineFormProps) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "import" ? "import" : "new";
  const isImport = mode === "import";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      guideline_type: undefined,
      status: isImport ? undefined : "draft",
      publishingSocieties: "",
      specialtyTags: "",
      version_number: "",
      effective_date: "",
      authors: [{ name: "", position: "", affiliation: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "authors",
  });

  const router = useRouter();

  async function onSubmit(data: FormValues) {
    const payload = {
      title: data.title,
      guideline_type: data.guideline_type,
      // "new" guidelines always start as draft, regardless of what's in
      // form state — the server also enforces this independently.
      status: isImport ? data.status : "draft",
      source: isImport ? "imported" : "authored",
      societies: data.publishingSocieties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      specialty_tags: data.specialtyTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      authors: data.authors,
      short_title: null,
      doi: null,
      next_review_date: null,
      version_number: data.version_number,
      effective_date: data.effective_date,
    };

    try {
      const res = await fetch("/api/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to create guideline: ${res.status}`);

      const { id } = await res.json();
      router.push(`/guidelines/${id}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isImport ? "Import existing guideline" : "Guideline details"}
          </CardTitle>
          <CardDescription>
            {isImport
              ? "Bring in a guideline already published outside this system."
              : "Core metadata for this clinical practice guideline."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-create-guideline"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="guideline-title">Title</FieldLabel>
                    <Input
                      {...field}
                      id="guideline-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Community-acquired pneumonia in children"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="publishingSocieties"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="guideline-societies">
                      Publishing societies
                    </FieldLabel>
                    <Input
                      {...field}
                      id="guideline-societies"
                      aria-invalid={fieldState.invalid}
                      placeholder="AAP, PIDS, IDSA"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="specialtyTags"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guideline-specialty-tags">
                        Specialty / Topic tags
                      </FieldLabel>
                      <Input
                        {...field}
                        id="guideline-specialty-tags"
                        aria-invalid={fieldState.invalid}
                        placeholder="Infectious disease, Pulmonology"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="guideline_type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guideline-type">Type</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          id="guideline-type"
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Compendium">Compendium</SelectItem>
                          <SelectItem value="Interim">Interim</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {isImport ? (
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="guideline-status">
                          Status
                        </FieldLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger
                            id="guideline-status"
                            className="w-full"
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="in_review">In review</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                ) : (
                  <div className="flex flex-col justify-end">
                    <span className="text-xs text-muted-foreground">
                      New guidelines start as <strong>Draft</strong> and move
                      through review from the editor.
                    </span>
                  </div>
                )}

                <Controller
                  name="version_number"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guideline-version">
                        Version
                      </FieldLabel>
                      <Input
                        {...field}
                        id="guideline-version"
                        aria-invalid={fieldState.invalid}
                        placeholder="v1.0"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="effective_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="guideline-effective-date">
                      Effective date
                    </FieldLabel>
                    <Input
                      {...field}
                      id="guideline-effective-date"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Authors & panel members</CardTitle>
            <CardDescription>
              Contributors listed on the published document
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", position: "", affiliation: "" })}
          >
            <Plus className="h-4 w-4" />
            Add author
          </Button>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {fields.length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 text-sm font-medium text-muted-foreground">
                <span>Name</span>
                <span>Position</span>
                <span>Affiliation</span>
                <span />
              </div>
            )}

            {fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start"
              >
                <Controller
                  name={`authors.${index}.name`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input {...field} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`authors.${index}.position`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input {...field} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name={`authors.${index}.affiliation`}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input {...field} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </FieldGroup>
        </CardContent>
      </Card>

      <Field orientation="horizontal" className="justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          form="form-create-guideline"
          className="bg-[#2F6B4F] hover:bg-[#2F6B4F]/95"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      </Field>
    </div>
  );
}
