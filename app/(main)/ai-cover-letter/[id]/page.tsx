// In app/(main)/ai-cover-letter/[id]/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/services/cover-letter";
import CoverLetterPreview from "../_components/CoverLetterPreview";


export default async function EditCoverLetterPage({ params }:  {params: Promise<{ id: string }>}) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter" className="cursor-pointer">
          <Button variant="link" className="gap-2 pl-0 ">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div className="flex flex-row justify-between items-center">
          <h1 className="text-6xl font-bold gradient-title mb-6 capitalize">
            {coverLetter.jobTitle} at {coverLetter.companyName}
          </h1>
        </div>
      </div>

      <CoverLetterPreview content={coverLetter.content} />
    </div>
  );
}