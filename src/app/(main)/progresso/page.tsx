// src/app/(main)/progresso/page.tsx
"use client";
import FastingHistory from "@/components/FastingHistory";
import FastingScoreCard from "@/components/FastingScoreCard"; // Import the new component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import Image from "next/image";

export default function ProgressoPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">Seu Progresso</h1>
        <p className="text-muted-foreground mt-2">Acompanhe sua evolução, histórico de jejuns e pontuação.</p>
      </header>
      
      <FastingScoreCard /> {/* Add the new component here */}

      <FastingHistory /> 
    </div>
  );
}
