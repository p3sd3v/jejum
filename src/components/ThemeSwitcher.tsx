
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  return (
    <RadioGroup
      value={theme}
      onValueChange={setTheme}
      className="space-y-2"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="light" id="light" />
        <Label htmlFor="light" className="flex items-center cursor-pointer">
          <Sun className="mr-2 h-5 w-5" /> Claro
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="dark" id="dark" />
        <Label htmlFor="dark" className="flex items-center cursor-pointer">
          <Moon className="mr-2 h-5 w-5" /> Escuro
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="system" id="system" />
        <Label htmlFor="system" className="flex items-center cursor-pointer">
          <Laptop className="mr-2 h-5 w-5" /> Sistema
        </Label>
      </div>
    </RadioGroup>
  );
}
