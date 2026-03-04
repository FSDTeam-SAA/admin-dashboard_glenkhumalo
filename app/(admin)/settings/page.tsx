"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authApi, userApi } from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";

type SettingsTab = "personal" | "password";

type PersonalFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("personal");
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [personalForm, setPersonalForm] = useState<PersonalFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: userApi.getMyProfile,
  });

  const previewAvatarUrl = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (previewAvatarUrl) URL.revokeObjectURL(previewAvatarUrl);
    };
  }, [previewAvatarUrl]);

  const updateProfileMutation = useMutation({
    mutationFn: (formData: FormData) => userApi.updateMyProfile(formData),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditingPersonal(false);
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setIsEditingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleSaveProfile = () => {
    const fullName = [
      personalForm.firstName.trim(),
      personalForm.lastName.trim(),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!fullName) {
      toast.error("Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", fullName);
    if (personalForm.phone.trim())
      formData.append("phone", personalForm.phone.trim());
    if (personalForm.bio.trim())
      formData.append("bio", personalForm.bio.trim());
    if (avatarFile) formData.append("avatar", avatarFile);

    updateProfileMutation.mutate(formData);
  };

  const handleSavePassword = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmNewPassword
    ) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const profile = profileQuery.data;
  const derivedPersonal = useMemo(() => {
    if (!profile) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bio: "",
      };
    }

    const { firstName, lastName } = splitName(profile.name || "");
    return {
      firstName,
      lastName,
      email: profile.email || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
    };
  }, [profile]);

  return (
    <div>
      <div>
        <PageHeader title="Settings" breadcrumbs={["Dashboard", "Settings"]} />

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={cn(
              "h-12 rounded-md border text-[18px] font-semibold transition",
              activeTab === "personal"
                ? "border-transparent bg-gradient-to-b from-[#1f4ba2] to-[#173a82] text-white"
                : "border-[#173a82] bg-white text-[#1c2434]",
            )}
          >
            Personal Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={cn(
              "h-12 rounded-md border text-[18px] font-semibold transition",
              activeTab === "password"
                ? "border-transparent bg-gradient-to-b from-[#1f4ba2] to-[#173a82] text-white"
                : "border-[#173a82] bg-white text-[#1c2434]",
            )}
          >
            Change Password
          </button>
        </div>

        <Card className="mt-6">
          <CardContent className="p-5 pt-5">
            {profileQuery.isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  {previewAvatarUrl ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-200">
                      <Image
                        src={previewAvatarUrl}
                        alt="avatar preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <Avatar
                      src={profile?.profileImage?.url}
                      name={profile?.name}
                      className="h-24 w-24 text-2xl"
                    />
                  )}
                  {activeTab === "personal" && isEditingPersonal ? (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#173a82] shadow-sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : null}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setAvatarFile(file || null);
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-[30px] font-semibold text-[#1b2333]">
                    {profile?.name || "Admin"}
                  </h3>
                  <p className="text-[20px] text-slate-700">
                    {profile?.role || "admin"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {activeTab === "personal" ? (
          <Card className="mt-6">
            <CardContent className="p-5 pt-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-[28px] font-semibold text-[#1b2333]">
                  Personal Information
                </h3>
                <Button
                  variant="default"
                  onClick={() => {
                    if (isEditingPersonal) {
                      setIsEditingPersonal(false);
                      setAvatarFile(null);
                      return;
                    }

                    setPersonalForm({
                      firstName: derivedPersonal.firstName,
                      lastName: derivedPersonal.lastName,
                      email: derivedPersonal.email,
                      phone: derivedPersonal.phone,
                      bio: derivedPersonal.bio,
                    });
                    setIsEditingPersonal(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {isEditingPersonal ? "Cancel" : "Edit"}
                </Button>
              </div>

              {profileQuery.isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-36 md:col-span-2" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                        First Name
                      </label>
                      <Input
                        value={
                          isEditingPersonal
                            ? personalForm.firstName
                            : derivedPersonal.firstName
                        }
                        disabled={!isEditingPersonal}
                        onChange={(event) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            firstName: event.target.value,
                          }))
                        }
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                        Last Name
                      </label>
                      <Input
                        value={
                          isEditingPersonal
                            ? personalForm.lastName
                            : derivedPersonal.lastName
                        }
                        disabled={!isEditingPersonal}
                        onChange={(event) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            lastName: event.target.value,
                          }))
                        }
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                        Email Address
                      </label>
                      <Input
                        value={derivedPersonal.email}
                        disabled
                        className="h-12 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                        Phone
                      </label>
                      <Input
                        value={
                          isEditingPersonal
                            ? personalForm.phone
                            : derivedPersonal.phone
                        }
                        disabled={!isEditingPersonal}
                        onChange={(event) =>
                          setPersonalForm((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                      Bio
                    </label>
                    <Textarea
                      value={
                        isEditingPersonal
                          ? personalForm.bio
                          : derivedPersonal.bio
                      }
                      disabled={!isEditingPersonal}
                      onChange={(event) =>
                        setPersonalForm((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      className="min-h-28 resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={
                        !isEditingPersonal || updateProfileMutation.isPending
                      }
                      className="min-w-44"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardContent className="p-5 pt-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-[28px] font-semibold text-[#1b2333]">
                  Change password
                </h3>
                <Button
                  variant="default"
                  onClick={() => setIsEditingPassword((prev) => !prev)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {isEditingPassword ? "Cancel" : "Edit"}
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    disabled={!isEditingPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: event.target.value,
                      }))
                    }
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    disabled={!isEditingPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1b2333]">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordForm.confirmNewPassword}
                    disabled={!isEditingPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmNewPassword: event.target.value,
                      }))
                    }
                    className="h-12"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSavePassword}
                  disabled={
                    !isEditingPassword || changePasswordMutation.isPending
                  }
                  className="min-w-44"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
