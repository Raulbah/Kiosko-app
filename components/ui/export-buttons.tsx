"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
    data: any[]; 
    filename?: string; 
    columns?: string[]; 
}

export function ExportButtons({ data, filename = "reporte", columns }: ExportButtonsProps) {
    
    // --- 1. PREPARAR DATOS ---
    const prepareData = () => {
        return data.map((item) => {
        const cleanItem: any = {};
        
        Object.keys(item).forEach((key) => {
            if (key.startsWith("original") || key === "actions" || key === "image") return;
            if (columns && !columns.includes(key)) return;

            let value = item[key];

            if (typeof value === "boolean") {
                value = value ? "Sí" : "No";
            }
            
            if (value instanceof Date) {
                value = value.toLocaleDateString();
            }

            cleanItem[key] = value;
        });
        return cleanItem;
        });
    };

    // --- 2. EXPORTAR A EXCEL ---
    const exportToExcel = () => {
        const cleanData = prepareData();
        const worksheet = XLSX.utils.json_to_sheet(cleanData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja1");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    // --- 3. EXPORTAR A PDF ---
    const exportToPDF = () => {
        const cleanData = prepareData();
        const doc = new jsPDF();

        const tableColumn = cleanData.length > 0 ? Object.keys(cleanData[0]).map(key => key.toUpperCase()) : [];
        
        // CORRECCIÓN AQUÍ: Agregamos 'as any[][]' para calmar a TypeScript
        // Le decimos: "Confía en mí, esto es un array de arrays válido para la tabla"
        const tableRows = cleanData.map(item => Object.values(item)) as any[][];

        doc.text(`${filename.toUpperCase()} - Reporte`, 14, 15);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows, 
            startY: 20,
            styles: { fontSize: 8 }, 
            headStyles: { fillColor: [22, 163, 74] }, 
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="flex gap-2">
        <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2 bg-green-600 text-white hover:bg-green-700 cursor-pointer"
            onClick={exportToExcel}
            title="Descargar Excel"
        >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
        </Button>
        
        <Button 
            variant="secondary" 
            size="sm"
            className="gap-2 cursor-pointer bg-red-600 text-white hover:bg-red-700"
            onClick={exportToPDF}
            title="Imprimir PDF"
        >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
        </Button>
        </div>
    );
}