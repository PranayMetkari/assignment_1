"use client";

import { useState } from "react";
import { LeadFormData } from "../../../types/lead";

export default function NewLeadPage() {
  const [formData, setFormData] =
    useState<LeadFormData>({
      name: "",
      email: "",
      company: "",
    });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.company.trim()
    ) {
      setError("All fields are required");
      return;
    }


    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      setError(
        "Please enter a valid email address"
      );
      return;
    }

    console.log("New Lead:", formData);

    setSuccess(
      "Lead created successfully!"
    );

    setFormData({
      name: "",
      email: "",
      company: "",
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold mb-6">
          Add New Lead
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block mb-2 text-zinc-400">
              Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block mb-2 text-zinc-400">
              Email
            </label>

            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block mb-2 text-zinc-400">
              Company
            </label>

            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  company: e.target.value,
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2"
              placeholder="Enter company"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            Create Lead
          </button>
        </form>
      </div>
    </div>
  );
}