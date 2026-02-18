import { Layout } from "@/components/Layout";
import { useInvoices, useCreateInvoice } from "@/hooks/use-sme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Download, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { jsPDF } from "jspdf";

export default function Invoices() {
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: create, isPending } = useCreateInvoice();
  const [open, setOpen] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([{ description: "", amount: 0 }]);

  const addItem = () => setItems([...items, { description: "", amount: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const updateItem = (idx: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const handleSubmit = () => {
    create({
      customerName,
      items,
      totalAmount: totalAmount * 100, // Convert to cents
    }, {
      onSuccess: () => {
        setOpen(false);
        setCustomerName("");
        setItems([{ description: "", amount: 0 }]);
      }
    });
  };

  const generatePDF = (invoice: any) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 20, 20);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Customer: ${invoice.customerName}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 50);
    doc.text(`Invoice ID: #INV-${invoice.id}`, 20, 60);

    let y = 80;
    doc.text("Description", 20, y);
    doc.text("Amount", 150, y);
    doc.line(20, y+2, 190, y+2);
    
    y += 10;
    (invoice.items as any[]).forEach((item) => {
      doc.text(item.description, 20, y);
      doc.text(`R ${item.amount.toFixed(2)}`, 150, y);
      y += 10;
    });

    doc.line(20, y, 190, y);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: R ${(invoice.totalAmount / 100).toFixed(2)}`, 120, y + 10);

    doc.save(`invoice-${invoice.id}.pdf`);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold">Invoices</h1>
            <p className="text-muted-foreground">Create and manage professional invoices.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Create Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Client Name or Company" />
                </div>
                
                <div className="space-y-3">
                  <Label>Line Items</Label>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        placeholder="Description" 
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        value={item.amount || ''}
                        onChange={(e) => updateItem(idx, 'amount', parseFloat(e.target.value))}
                        className="w-24"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addItem} className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                  </Button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="text-xl font-bold text-primary">R {totalAmount.toFixed(2)}</span>
                </div>

                <Button onClick={handleSubmit} className="w-full" disabled={isPending || !customerName}>
                  {isPending ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {invoices?.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{invoice.customerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.createdAt || "").toLocaleDateString()} • #INV-{invoice.id}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className="text-lg font-bold">R {(invoice.totalAmount / 100).toFixed(2)}</span>
                  <Button variant="outline" size="sm" onClick={() => generatePDF(invoice)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!invoices?.length && !isLoading && (
             <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
               No invoices found. Create one to get paid!
             </div>
          )}
        </div>
      </div>
    </>
  );
}
