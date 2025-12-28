"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetBranchCookie } from "@/lib/actions/kiosk-actions";

export function ChangeBranchBtn() {
    return (
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground hover:text-destructive gap-2 cursor-pointer"
            onClick={() => resetBranchCookie()}
        >
        <LogOut className="h-3 w-3" />
            Cambiar Sucursal
        </Button>
    );
}