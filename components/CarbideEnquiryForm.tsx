"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Send } from "lucide-react";

const initialValues = {
  fullName: "", companyName: "", email: "", phone: "", material: "",
  preferredForm: "", quantity: "", unit: "", grade: "", requirements: "",
};

export default function CarbideEnquiryForm() {
  const [values, setValues] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const requirement = [
      "Carbide scrap enquiry",
      `Material: ${values.material}`,
      `Preferred form: ${values.preferredForm || "Not specified"}`,
      `Quantity required: ${values.quantity} ${values.unit}`,
      `Grade / specification: ${values.grade || "Not specified"}`,
      `Additional requirements: ${values.requirements || "None"}`,
    ].join(" | ");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          country: "India",
          companyName: values.companyName,
          companyAddress: "",
          email: values.email,
          phone: values.phone,
          machineInterest: `Carbide Scrap - ${values.material}`,
          message: requirement,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || "Unable to submit your enquiry.");
      setValues(initialValues);
      setMessage(result?.message || "Your enquiry has been submitted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit your enquiry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const control = "min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#145b93] focus:ring-2 focus:ring-sky-100";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_22px_60px_rgba(15,23,42,0.10)] sm:p-6 lg:p-8">
      <h2 className="text-2xl font-black text-[#071c3c] sm:text-3xl">Send Your Requirement</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600 sm:text-base">Fill in the details below and we will get back to you with the best options.</p>
      <span className="mt-4 block h-0.5 w-24 bg-[#E32636]" />

      <form onSubmit={handleSubmit} className="mt-7 grid gap-4 sm:grid-cols-2">
        <Field label="Your Name *"><input required name="fullName" value={values.fullName} onChange={handleChange} className={control} placeholder="Enter your name" autoComplete="name" /></Field>
        <Field label="Company Name"><input name="companyName" value={values.companyName} onChange={handleChange} className={control} placeholder="Enter company name" autoComplete="organization" /></Field>
        <Field label="Email Address *"><input required type="email" name="email" value={values.email} onChange={handleChange} className={control} placeholder="Enter your email" autoComplete="email" /></Field>
        <Field label="Mobile / WhatsApp Number *"><input required type="tel" name="phone" value={values.phone} onChange={handleChange} className={control} placeholder="Enter phone number" autoComplete="tel" /></Field>
        <Field label="Material Required *"><select required name="material" value={values.material} onChange={handleChange} className={control}><option value="">Select carbide scrap material</option><option>Carbide Inserts</option><option>Carbide Rods</option><option>Carbide Drills / End Mills</option><option>Carbide Sludge / Powder</option><option>Mixed Carbide Scrap</option><option>Other Carbide Scrap</option></select></Field>
        <Field label="Preferred Form"><select name="preferredForm" value={values.preferredForm} onChange={handleChange} className={control}><option value="">Select form</option><option>Inserts</option><option>Rods</option><option>Chips</option><option>Powder / Sludge</option><option>Mixed</option><option>Other</option></select></Field>
        <Field label="Quantity Required *"><div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2"><input required name="quantity" value={values.quantity} onChange={handleChange} className={control} placeholder="Quantity" /><select required name="unit" value={values.unit} onChange={handleChange} className={control}><option value="">Unit</option><option>Kg</option><option>MT</option><option>Pieces</option></select></div></Field>
        <Field label="Grade / Specification (If any)"><input name="grade" value={values.grade} onChange={handleChange} className={control} placeholder="Enter grade or specification" /></Field>
        <div className="sm:col-span-2"><Field label="Additional Requirements (Optional)"><textarea name="requirements" value={values.requirements} onChange={handleChange} rows={4} className={`${control} py-3`} placeholder="Any other specific requirement or message" /></Field></div>
        {message ? <p className="rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 sm:col-span-2" role="status">{message}</p> : null}
        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#df202c] px-6 py-3 font-black uppercase tracking-wide text-white transition hover:bg-[#c71925] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
          <Send className="h-5 w-5" />{isSubmitting ? "Submitting..." : "Submit Enquiry"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold text-[#071c3c]">{label}</span>{children}</label>;
}
