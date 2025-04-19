import { getResume } from "@/services/resume";
import ResumeBuilder from "./_components/ResumeBuilder";
import { BarLoader } from "react-spinners";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="container mx-auto space-y-10 py-6">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}