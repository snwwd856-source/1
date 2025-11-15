import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, TrendingUp } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ManageLevels() {
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    upgradePrice: "",
    earningShare: "",
    withdrawMin: "",
    name: "",
    description: "",
  });

  const { data: levels, isLoading, refetch } = trpc.levels.list.useQuery();

  const updateMutation = trpc.levels.update.useMutation({
    onSuccess: () => {
      toast.success("Level updated successfully");
      setEditingLevel(null);
      resetForm();
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      upgradePrice: "",
      earningShare: "",
      withdrawMin: "",
      name: "",
      description: "",
    });
  };

  const handleEdit = (level: any) => {
    setEditingLevel(level.id);
    setFormData({
      upgradePrice: ((level.upgradePrice || 0) / 100).toString(),
      earningShare: (level.earningShare || 0).toString(),
      withdrawMin: ((level.minimumWithdrawal || 0) / 100).toString(),
      name: level.name || "",
      description: level.description || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLevel !== null) {
      updateMutation.mutate({
        id: editingLevel,
        upgradePrice: formData.upgradePrice ? parseFloat(formData.upgradePrice) : undefined,
        earningShare: formData.earningShare ? parseInt(formData.earningShare) : undefined,
        withdrawMin: formData.withdrawMin ? parseFloat(formData.withdrawMin) : undefined,
        name: formData.name || undefined,
        description: formData.description || undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">Manage Levels</h1>
        </div>
      </div>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-full text-center py-8">Loading...</div>
          ) : (
            levels?.map((level: any) => (
              <Card key={level.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      {level.name}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(level)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>{level.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Upgrade Price</p>
                    <p className="text-2xl font-bold text-primary">
                      ${((level.upgradePrice || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Earning Share</p>
                      <p className="text-xl font-bold text-green-600">{level.earningShare || 0}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Min Withdraw</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${((level.minimumWithdrawal || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {editingLevel !== null && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Edit {levels?.find((l: any) => l.id === editingLevel)?.name}</CardTitle>
              <CardDescription>Update level configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Upgrade Price (USD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.upgradePrice}
                      onChange={(e) => setFormData({ ...formData, upgradePrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Earning Share (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.earningShare}
                      onChange={(e) => setFormData({ ...formData, earningShare: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Min Withdrawal (USD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.withdrawMin}
                      onChange={(e) => setFormData({ ...formData, withdrawMin: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setEditingLevel(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Levels Overview</CardTitle>
            <CardDescription>Complete comparison of all membership levels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Level</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Upgrade Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Earning Share</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Min Withdraw</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levels?.map((level: any) => (
                      <tr key={level.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-900 font-medium">{level.name}</td>
                        <td className="py-3 px-4 text-slate-900">
                          ${((level.upgradePrice || 0) / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            {level.earningShare || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-900">
                          ${((level.minimumWithdrawal || 0) / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(level)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
