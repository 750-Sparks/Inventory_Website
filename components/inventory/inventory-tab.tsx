"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Package, Loader2, ExternalLink, Trash2, Check, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryPart } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

interface InventoryTabProps {
  refreshTrigger: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const supplierLabels: Record<string, string> = {
  vexstore: "VEX Store",
  robosource: "RoboSource",
  other: "Other",
};

export function InventoryTab({ refreshTrigger }: InventoryTabProps) {
  const [inventory, setInventory] = useState<InventoryPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<InventoryPart | null>(null);
  const [editingStock, setEditingStock] = useState<{ partNumber: string; value: string } | null>(null);
  const [formData, setFormData] = useState<InventoryPart>({
    part_number: "",
    name: "",
    category: "Custom",
    in_stock: 0,
    min_required: 0,
    unit_price: 0,
    supplier: "other",
    supplier_url: "",
  });

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [refreshTrigger]);

  const filteredInventory = inventory.filter((part) => {
    const matchesSearch =
      searchTerm === "" ||
      part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || part.category === categoryFilter;
    const matchesSupplier = supplierFilter === "all" || part.supplier === supplierFilter;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const handleStockUpdate = async (partNumber: string, newStock: number) => {
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-stock",
          part_number: partNumber,
          in_stock: newStock,
        }),
      });
      fetchInventory();
      setEditingStock(null);
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const handleDeletePart = async (partNumber: string) => {
    try {
      await fetch(`/api/inventory?partNumber=${partNumber}`, {
        method: "DELETE",
      });
      fetchInventory();
    } catch (error) {
      console.error("Failed to delete part:", error);
    }
  };

  const openAddModal = () => {
    setEditingPart(null);
    setFormData({
      part_number: "",
      name: "",
      category: "Custom",
      in_stock: 0,
      min_required: 0,
      unit_price: 0,
      supplier: "other",
      supplier_url: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (part: InventoryPart) => {
    setEditingPart(part);
    setFormData({ ...part });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error("Failed to save part:", error);
    }
  };

  const getStatus = (part: InventoryPart) => {
    if (part.in_stock <= 0) return "critical";
    if (part.in_stock <= part.min_required) return "low";
    return "ok";
  };

  const totalValue = filteredInventory.reduce((sum, p) => sum + p.in_stock * p.unit_price, 0);
  const lowStockCount = filteredInventory.filter((p) => p.in_stock <= p.min_required && p.in_stock > 0).length;
  const outOfStockCount = filteredInventory.filter((p) => p.in_stock === 0).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4 flex items-center gap-3 border-border bg-card">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Parts</p>
            <p className="text-xl font-bold">{filteredInventory.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-border bg-card">
          <div className="p-2.5 rounded-lg bg-chart-2/10">
            <Package className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-border bg-card">
          <div className="p-2.5 rounded-lg bg-warning/10">
            <Package className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="text-xl font-bold">{lowStockCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-border bg-card">
          <div className="p-2.5 rounded-lg bg-destructive/10">
            <Package className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-xl font-bold">{outOfStockCount}</p>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search parts by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] bg-card border-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[140px] bg-card border-border">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              <SelectItem value="vexstore">VEX Store</SelectItem>
              <SelectItem value="robosource">RoboSource</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openAddModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Part
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-sm text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Part</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Supplier</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-center">Stock</th>
                  <th className="px-4 py-3 font-medium text-right">Value</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((part, index) => {
                  const status = getStatus(part);
                  const isEditingThisStock = editingStock?.partNumber === part.part_number;

                  return (
                    <tr
                      key={part.part_number}
                      className="border-b border-border/50 hover:bg-secondary/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{part.part_number}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{part.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{supplierLabels[part.supplier] || "Other"}</span>
                          {part.supplier_url && (
                            <a
                              href={part.supplier_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {formatCurrency(part.unit_price)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {isEditingThisStock ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                value={editingStock.value}
                                onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
                                className="w-16 h-8 text-center bg-secondary border-border"
                                autoFocus
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleStockUpdate(part.part_number, parseInt(editingStock.value) || 0)}
                              >
                                <Check className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => setEditingStock(null)}
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingStock({ partNumber: part.part_number, value: String(part.in_stock) })}
                              className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors font-medium"
                            >
                              {part.in_stock}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(part.in_stock * part.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditModal(part)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Part</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {part.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePart(part.part_number)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredInventory.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No parts found matching your filters</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPart ? "Edit Part" : "Add New Part"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Part Number</Label>
                <Input
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  placeholder="e.g., 217-2700"
                  disabled={!!editingPart}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Part Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VEX 84 Tooth Gear"
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>In Stock</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.in_stock}
                  onChange={(e) => setFormData({ ...formData, in_stock: parseInt(e.target.value) || 0 })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Min Required</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.min_required}
                  onChange={(e) => setFormData({ ...formData, min_required: parseInt(e.target.value) || 0 })}
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price ($)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select
                  value={formData.supplier}
                  onValueChange={(value: "vexstore" | "robosource" | "other") =>
                    setFormData({ ...formData, supplier: value })
                  }
                >
                  <SelectTrigger className="bg-secondary/50 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vexstore">VEX Store</SelectItem>
                    <SelectItem value="robosource">RoboSource</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Supplier URL</Label>
                <Input
                  value={formData.supplier_url || ""}
                  onChange={(e) => setFormData({ ...formData, supplier_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-border">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPart ? "Save Changes" : "Add Part"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: "ok" | "low" | "critical" }) {
  const config = {
    ok: { bg: "bg-primary/20 text-primary", label: "OK" },
    low: { bg: "bg-warning/20 text-warning", label: "LOW" },
    critical: { bg: "bg-destructive/20 text-destructive", label: "OUT" },
  };

  const { bg, label } = config[status];

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", bg)}>
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",
          status === "ok" && "bg-primary",
          status === "low" && "bg-warning",
          status === "critical" && "bg-destructive animate-pulse"
        )}
      />
      {label}
    </span>
  );
}
