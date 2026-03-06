import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Dumbbell, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const difficultyColor = {
  beginner: "bg-green-500/20 text-green-300",
  intermediate: "bg-yellow-500/20 text-yellow-300",
  advanced: "bg-orange-500/20 text-orange-300",
  expert: "bg-red-500/20 text-red-300",
};

export default function RecommendedPrograms({ programs: propPrograms }) {
  const { user } = useAuth();
  const userSports = user?.preferred_sports || [];

  const { data: fetchedPrograms = [] } = useQuery({
    queryKey: ["recommended-programs", userSports.join(",")],
    queryFn: async () => {
      const all = await base44.entities.TrainingProgram.list("-created_date", 20);
      return all.sort((a, b) => {
        const aMatch = userSports.includes(a.sport) ? 1 : 0;
        const bMatch = userSports.includes(b.sport) ? 1 : 0;
        return bMatch - aMatch;
      });
    },
    enabled: !propPrograms?.length && !!user,
    staleTime: 5 * 60 * 1000,
  });

  const programs = propPrograms?.length ? propPrograms : fetchedPrograms;

  if (!programs.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dumbbell className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-bold text-white">Training Programs for You</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {programs.slice(0, 4).map(program => (
          <Link
            key={program.id}
            to={createPageUrl("MyTraining")}
            className="block bg-slate-800/80 border border-slate-700 hover:border-orange-500/50 rounded-2xl p-4 transition-all hover:scale-[1.01]"
          >
            <p className="font-bold text-white text-sm">{program.name}</p>
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{program.description}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {program.sport && <Badge className="bg-orange-500/20 text-orange-300 text-xs">{program.sport}</Badge>}
              {program.difficulty && (
                <Badge className={`text-xs ${difficultyColor[program.difficulty] || "bg-slate-700 text-slate-300"}`}>
                  {program.difficulty}
                </Badge>
              )}
              {program.duration_weeks && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{program.duration_weeks}w
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
