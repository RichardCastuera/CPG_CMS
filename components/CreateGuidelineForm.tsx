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
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(160, "Title must be at most 160 characters."),
  publishingSocieties: z.string().min(1, "Enter at least one society."),
  topics: z.string().min(1, "Enter at least one topic."),
  type: z.enum(["Compendium", "Interim"]),
  status: z.enum(["draft", "in_review", "published", "archived"]),
  version: z.string().min(1, "Enter a version number, e.g. v1.0."),
  publicationDate: z.string().min(1, "Select a publication date."),
  lastRevision: z.string().min(1, "Select a last revision date."),
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      publishingSocieties: "",
      topics: "",
      type: undefined,
      status: undefined,
      version: "",
      publicationDate: "",
      lastRevision: "",
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
      ...data,
      publishingSocieties: data.publishingSocieties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      topics: data.topics
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    // TODO: replace with your actual Supabase insert
    // const { data: newGuideline, error } = await supabase.from("guidelines").insert({...}).select().single();
    // if (error) { /* show error toast */ return; }

    console.log(payload);
    // router.push(`/guideline/${newGuideline.id}`);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guideline details</CardTitle>
          <CardDescription>
            Core metadata for this clinical practice guideline.
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
                  name="topics"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guideline-topics">
                        Specialty / Topic tags
                      </FieldLabel>
                      <Input
                        {...field}
                        id="guideline-topics"
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
                  name="type"
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
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guideline-status">Status</FieldLabel>
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

                <Controller
                  name="version"
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

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="publicationDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guideline-publication-date">
                        Publication date
                      </FieldLabel>
                      <Input
                        {...field}
                        id="guideline-publication-date"
                        type="date"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="lastRevision"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guideline-last-revision">
                        Last revision
                      </FieldLabel>
                      <Input
                        {...field}
                        id="guideline-last-revision"
                        type="date"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
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
