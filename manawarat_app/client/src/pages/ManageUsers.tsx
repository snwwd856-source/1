import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, TrendingUp, CheckCircle, XCircle, Shield, DollarSign } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ManageUsers() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showDebitDialog, setShowDebitDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.admin.listUsers.useQuery({
    limit: 50,
    offset: page * 50,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
  });

  const approveMutation = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      toast.success("User approved successfully");
      refetch();
    },
  });

  const rejectMutation = trpc.admin.rejectUser.useMutation({
    onSuccess: () => {
      toast.success("User rejected");
      refetch();
    },
  });

  const updateLevelMutation = trpc.admin.updateUserLevel.useMutation({
    onSuccess: () => {
      toast.success("User level updated");
      setEditingUser(null);
      refetch();
    },
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      setEditingUser(null);
      refetch();
    },
  });

  const creditMutation = trpc.admin.creditUserBalance.useMutation({
    onSuccess: () => {
      toast.success("Balance credited successfully");
      setShowCreditDialog(false);
      refetch();
    },
  });

  const debitMutation = trpc.admin.debitUserBalance.useMutation({
    onSuccess: () => {
      toast.success("Balance debited successfully");
      setShowDebitDialog(false);
      refetch();
    },
  });

  const handleApprove = (userId: number) => {
    if (confirm("Are you sure you want to approve this user?")) {
      approveMutation.mutate({ userId });
    }
  };

  const handleReject = (userId: number) => {
    const reason = prompt("Enter rejection reason (optional):");
    rejectMutation.mutate({ userId, reason: reason || undefined });
  };

  const handleUpdateLevel = (userId: number, levelId: number) => {
    updateLevelMutation.mutate({ userId, levelId });
  };

  const handleUpdateRole = (userId: number, role: string) => {
    if (confirm(`Are you sure you want to change this user's role to ${role}?`)) {
      updateRoleMutation.mutate({ userId, role: role as any });
    }
  };

  const handleCredit = (userId: number, amount: number, reason: string) => {
    creditMutation.mutate({ userId, amountUsd: amount, reason });
  };

  const handleDebit = (userId: number, amount: number, reason: string) => {
    debitMutation.mutate({ userId, amountUsd: amount, reason });
  };

  const isSuperAdmin = user?.role === "super_admin";
  const isFinanceAdmin = user?.role === "finance_admin" || isSuperAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">Manage Users</h1>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>All Users ({data?.total || 0})</CardTitle>
            <CardDescription>Manage platform users and their levels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Username</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Level</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Balance</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.users.map((user: any) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-900 font-medium">{user.username}</td>
                        <td className="py-3 px-4 text-slate-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Level {user.levelId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-900 font-medium">
                          ${((user.balanceUsd || 0) / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-700"
                                : user.status === "pending_approval"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {user.status === "pending_approval" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleApprove(user.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleReject(user.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {isFinanceAdmin && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setShowCreditDialog(true);
                                  }}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {isSuperAdmin && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-600 hover:text-slate-700"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser.username}</DialogTitle>
              <DialogDescription>Update user level and role</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <Select
                  value={editingUser.levelId?.toString()}
                  onValueChange={(val) => handleUpdateLevel(editingUser.id, parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Select
                  value={editingUser.role}
                  onValueChange={(val) => handleUpdateRole(editingUser.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="content_admin">Content Admin</SelectItem>
                    <SelectItem value="support_admin">Support Admin</SelectItem>
                    <SelectItem value="finance_admin">Finance Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Credit Balance Dialog */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credit User Balance</DialogTitle>
            <DialogDescription>Add funds to user account</DialogDescription>
          </DialogHeader>
          <CreditDebitForm
            userId={selectedUserId!}
            type="credit"
            onSubmit={(amount, reason) => {
              handleCredit(selectedUserId!, amount, reason);
            }}
            onCancel={() => setShowCreditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Debit Balance Dialog */}
      <Dialog open={showDebitDialog} onOpenChange={setShowDebitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debit User Balance</DialogTitle>
            <DialogDescription>Remove funds from user account</DialogDescription>
          </DialogHeader>
          <CreditDebitForm
            userId={selectedUserId!}
            type="debit"
            onSubmit={(amount, reason) => {
              handleDebit(selectedUserId!, amount, reason);
            }}
            onCancel={() => setShowDebitDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreditDebitForm({
  userId,
  type,
  onSubmit,
  onCancel,
}: {
  userId: number;
  type: "credit" | "debit";
  onSubmit: (amount: number, reason: string) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Amount (USD)</label>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Reason</label>
        <Input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for this transaction"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            if (amount && reason) {
              onSubmit(parseFloat(amount), reason);
            }
          }}
        >
          {type === "credit" ? "Credit" : "Debit"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
