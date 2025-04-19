"use client";

import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";

type CoverLetterPreviewProps = {
  content: string;
};

const CoverLetterPreview = ({ content }: CoverLetterPreviewProps) => {
  const { user } = useUser();
  const [coverLetterContent, setCoverLetterContent] = useState<string>("");

  useEffect(() => {
    if (content) {
      let cleanContent = content
        .replace(/```markdown/g, '')
        .replace(/```/g, '');
      
      cleanContent = cleanContent
        .replace(/\[Your Name\]/g, user?.fullName || '[Your Name]')
        .replace(/\[Your Email Address\]/g, user?.emailAddresses?.[0]?.emailAddress || '[Your Email Address]')
        .replace(/\[Date\]/g, format(new Date(), 'dd/MM/yyyy'));
      const lines = cleanContent.split('\n');
      
      const formattedLines = lines.map((line, index) => {
        if (index < 8) {
          return line.trim() ? `${line.trim()}  ` : '';
        }
        if (line.includes('**Subject:') || line.includes('Dear Hiring Manager')) {
          return `${line.trim()}  \n`;
        }
        
        return line.trim();
      });
      
      cleanContent = formattedLines.join('\n');
      cleanContent = cleanContent
        .replace(/(\*\*Subject:.+?\*\*)(\s*)/g, '$1\n\n')
        .replace(/(Dear Hiring Manager,)(\s*)/g, '$1\n\n')
        .replace(/(Sincerely,)(\s*)/g, '$1\n\n').trim();
      
      setCoverLetterContent(cleanContent);
    }
  }, [content, user]);

  return (
    <div className="py-4">
      <MDEditor
        value={coverLetterContent}
        onChange={(value) => setCoverLetterContent(value || "")}
        preview="edit"
        height={700}
      />
    </div>
  );
};

export default CoverLetterPreview;