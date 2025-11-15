import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ManageWallets() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const [formData, setFormData] = useState({
    chain: "TRC20",
    currency: "USDT",
    address: "",
    label: "",
  });

  const { data: wallets, isLoading, refetch } = trpc.wallets.list.useQuery();

  const createMutation = trpc.wallets.create.useMutation({
    onSuccess: () => {
      toast.success("Wallet created successfully");
      setShowCreateForm(false);
      resetForm();
      refetch();
    },
  });

  const updateMutation = trpc.wallets.update.useMutation({
    onSuccess: () => {
      toast.success("Wallet updated successfully");
      setEditingWallet(null);
      resetForm();
      refetch();
    },
  });

  const deleteMutation = trpc.wallets.delete.useMutation({
    onSuccess: () => {
      toast.success("Wallet deleted successfully");
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      chain: "TRC20",
      currency: "USDT",
      address: "",
      label: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWallet) {
      updateMutation.mutate({
        id: editingWallet.id,
        address: formData.address || undefined,
        label: formData.label || undefined,
      });
    } else {
      createMutation.mutate({
        chain: formData.chain,
        currency: formData.currency,
        address: formData.address,
        label: formData.label || undefined,
      });
    }
  };

  const handleEdit = (wallet: any) => {
    setEditingWallet(wallet);
    setFormData({
      chain: wallet.chain,
      currency: wallet.currency,
      address: wallet.address,
      label: wallet.label || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this wallet?")) {
      deleteMutation.mutate({ id });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">Manage Wallets</h1>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            onClick={() => {
              resetForm();
              setEditingWallet(null);
              setShowCreateForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Wallet
          </Button>
        </div>
      </div>

      <main className="container py-8">
        {showCreateForm && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>{editingWallet ? "Edit Wallet" : "Add New Wallet"}</CardTitle>
              <CardDescription>Add a new wallet address for payments</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Chain</label>
                    <Select
                      value={formData.chain}
                      onValueChange={(val) => setFormData({ ...formData, chain: val })}
                      disabled={!!editingWallet}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRC20">TRC20</SelectItem>
                        <SelectItem value="ERC20">ERC20</SelectItem>
                        <SelectItem value="BEP20">BEP20</SelectItem>
                        <SelectItem value="Polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Currency</label>
                    <Select
                      value={formData.currency}
                      onValueChange={(val) => setFormData({ ...formData, currency: val })}
                      disabled={!!editingWallet}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="BUSD">BUSD</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Wallet Address</label>
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Label (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g., Main Wallet"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    {editingWallet ? "Update Wallet" : "Add Wallet"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                      setEditingWallet(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
          ) : (
            wallets?.map((wallet: any) => (
              <Card key={wallet.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{wallet.label || `${wallet.chain} ${wallet.currency}`}</CardTitle>
                      <CardDescription>
                        {wallet.chain} - {wallet.currency}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        wallet.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {wallet.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Address</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-xs text-slate-900 break-all">{wallet.address}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-600 hover:text-slate-700"
                        onClick={() => copyToClipboard(wallet.address)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Created: {new Date(wallet.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(wallet)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(wallet.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
