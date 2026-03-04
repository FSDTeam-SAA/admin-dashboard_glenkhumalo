"use client";

import { ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { websiteApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

type SectionState = {
  title: string;
  bodyText: string;
  image: File | null;
};

export default function WebsitePage() {
  const [search, setSearch] = useState("");
  const [hero, setHero] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [about, setAbout] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [creative, setCreative] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [client, setClient] = useState<SectionState>({
    title: "",
    bodyText: "",
    image: null,
  });
  const [contact, setContact] = useState({
    address: "",
    phoneNumber: "",
    email: "",
  });
  const [creativeImages, setCreativeImages] = useState<File[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["website-content"],
    queryFn: websiteApi.getWebsiteContent,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const heroForm = new FormData();
      heroForm.append("title", hero.title || data?.hero.title || "Hero Title");
      heroForm.append(
        "bodyText",
        hero.bodyText || data?.hero.bodyText || "Hero body",
      );
      if (hero.image) heroForm.append("image", hero.image);

      const aboutForm = new FormData();
      aboutForm.append(
        "title",
        about.title || data?.about.title || "About Title",
      );
      aboutForm.append(
        "bodyText",
        about.bodyText || data?.about.bodyText || "About body",
      );
      if (about.image) aboutForm.append("image", about.image);

      const creativeForm = new FormData();
      creativeForm.append(
        "title",
        creative.title || data?.creative.title || "Creative Title",
      );
      creativeForm.append(
        "bodyText",
        creative.bodyText || data?.creative.bodyText || "Creative body",
      );
      if (creative.image) creativeForm.append("heroImage", creative.image);
      creativeImages.forEach((image) => creativeForm.append("images", image));

      const clientForm = new FormData();
      clientForm.append(
        "title",
        client.title || data?.client.title || "Client Title",
      );
      clientForm.append(
        "bodyText",
        client.bodyText || data?.client.bodyText || "Client body",
      );
      if (client.image) clientForm.append("image", client.image);

      await Promise.all([
        websiteApi.updateHero(heroForm),
        websiteApi.updateAbout(aboutForm),
        websiteApi.updateCreative(creativeForm),
        websiteApi.updateClient(clientForm),
        websiteApi.updateContact({
          address: contact.address || data?.contact.address || "",
          phoneNumber: contact.phoneNumber || data?.contact.phoneNumber || "",
          email: contact.email || data?.contact.email || "",
        }),
      ]);
    },
    onSuccess: async () => {
      toast.success("Website content updated");
      await refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div>
      <div>
        <Card>
          <CardContent>
            <PageHeader
              title="Manage website"
              breadcrumbs={["Dashboard", "Manage Website"]}
              actions={<Button variant="outline">Edit Website</Button>}
            />

            {isLoading ? (
              <Skeleton className="h-[900px] w-full" />
            ) : (
              <div className="space-y-5">
                <WebsiteSection
                  title="Hero section"
                  state={hero}
                  setState={setHero}
                  currentTitle={data?.hero.title}
                  currentBody={data?.hero.bodyText}
                />
                <WebsiteSection
                  title="About us"
                  state={about}
                  setState={setAbout}
                  currentTitle={data?.about.title}
                  currentBody={data?.about.bodyText}
                />
                <WebsiteSection
                  title="Creative"
                  state={creative}
                  setState={setCreative}
                  currentTitle={data?.creative.title}
                  currentBody={data?.creative.bodyText}
                  onMultiImage={setCreativeImages}
                />
                <WebsiteSection
                  title="Client"
                  state={client}
                  setState={setClient}
                  currentTitle={data?.client.title}
                  currentBody={data?.client.bodyText}
                />

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="mb-2 text-lg font-semibold">Contact</p>
                  <div className="space-y-3">
                    <Field
                      label="Address"
                      value={contact.address}
                      placeholder={data?.contact.address || "Address"}
                      onChange={(value) =>
                        setContact((prev) => ({ ...prev, address: value }))
                      }
                    />
                    <Field
                      label="Phone number"
                      value={contact.phoneNumber}
                      placeholder={data?.contact.phoneNumber || "+555"}
                      onChange={(value) =>
                        setContact((prev) => ({ ...prev, phoneNumber: value }))
                      }
                    />
                    <Field
                      label="Email"
                      value={contact.email}
                      placeholder={data?.contact.email || "you@gmail.com"}
                      onChange={(value) =>
                        setContact((prev) => ({ ...prev, email: value }))
                      }
                    />
                  </div>
                </div>

                <Button
                  className="h-12 w-full"
                  onClick={() => updateMutation.mutate()}
                >
                  {updateMutation.isPending
                    ? "Saving..."
                    : "Save Website Content"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WebsiteSection({
  title,
  state,
  setState,
  currentTitle,
  currentBody,
  onMultiImage,
}: {
  title: string;
  state: SectionState;
  setState: (state: SectionState) => void;
  currentTitle?: string;
  currentBody?: string;
  onMultiImage?: (files: File[]) => void;
}) {
  const onSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setState({ ...state, image: file });
  };

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-2 text-lg font-semibold">{title}</p>
      <div className="space-y-3">
        <Field
          label="Title"
          value={state.title}
          placeholder={currentTitle || "Job Post"}
          onChange={(value) => setState({ ...state, title: value })}
        />
        <div>
          <p className="mb-1 text-base font-medium">Body text</p>
          <Textarea
            value={state.bodyText}
            placeholder={currentBody || "$12.00"}
            onChange={(event) =>
              setState({ ...state, bodyText: event.target.value })
            }
            className="min-h-20"
          />
        </div>
        <label className="block rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onSelectImage}
          />
          <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
          <p className="my-2 text-slate-500">
            {state.image ? state.image.name : "Upload Photo"}
          </p>
          <Button type="button">Upload Photo</Button>
        </label>

        {onMultiImage ? (
          <label className="block rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(event) =>
                onMultiImage(Array.from(event.target.files || []))
              }
            />
            <p className="text-slate-500">Upload additional creative images</p>
          </label>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-base font-medium">{label}</p>
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12"
      />
    </div>
  );
}
