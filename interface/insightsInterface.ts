export interface RoleInterface{
   role:string,
   min:number,
   max:number,
   median:number,
   location:string,
}

export interface InsightsInterface {
    _id: string;
    createdAt: string; 
    updatedAt: string; 
    demandLevel: "High" | "Medium" | "Low"; 
    growthRate: number;
    industry: string;
    keyTrends: string[];
    marketOutlook: "Positive" | "Neutral" | "Negative"; 
    nextUpdate: string; // ISO date string
    recommendedSkills: string[];
    salaryRanges: RoleInterface[];
    topSkills: string[];
  }

export interface LevelInterface{
  high:string,
  medium:string,
  low:string,
}
