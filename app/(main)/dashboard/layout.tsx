import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 w-full">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <BarLoader color="gray"  width={'50%'} loading={true}/>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
