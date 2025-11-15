import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Zap, DollarSign, TrendingUp, AlertCircle, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real data from backend
  const { data: stats, isLoading: statsLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: pendingProofs, isLoading: proofsLoading } = trpc.taskAssignments.getPendingProofs.useQuery();
  const { data: pendingWithdrawals, isLoading: withdrawalsLoading } = trpc.admin.getPendingWithdrawals.useQuery();

  // Mock data for charts (TODO: implement real chart data)
  const revenueData = [
    { month: "Jan", revenue: 4000, tasks: 2400 },
    { month: "Feb", revenue: 3000, tasks: 1398 },
    { month: "Mar", revenue: 2000, tasks: 9800 },
    { month: "Apr", revenue: 2780, tasks: 3908 },
    { month: "May", revenue: 1890, tasks: 4800 },
    { month: "Jun", revenue: 2390, tasks: 3800 },
  ];

  const taskDistribution = [
    { name: "Trading", value: 35 },
    { name: "Marketing", value: 25 },
    { name: "Referral", value: 20 },
    { name: "Learning", value: 20 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const adminRoles = ['super_admin', 'finance_admin', 'support_admin', 'content_admin'];
  if (!user || !adminRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">You don't have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user.fullName || user.username || user.email}</span>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Total Users</span>
                <Users className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.totalUsers.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {stats?.pendingUsers ? `${stats.pendingUsers} pending approval` : "All active"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Active Tasks</span>
                <Zap className="h-5 w-5 text-secondary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.activeTasks || "0"}
              </div>
              <p className="text-xs text-slate-600 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Pending Proofs</span>
                <AlertCircle className="h-5 w-5 text-accent" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.pendingProofs || "0"}
              </div>
              <p className="text-xs text-slate-600 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Platform Revenue</span>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : `$${(stats?.platformRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
              <p className="text-xs text-slate-600 mt-1">Total revenue</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Pending Withdrawals</span>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {statsLoading ? "..." : stats?.pendingWithdrawals || "0"}
              </div>
              <p className="text-xs text-slate-600 mt-1">Requests pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Revenue & Tasks Trend</CardTitle>
              <CardDescription>Last 6 months performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#f8fafc", 
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem"
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                  <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
              <CardDescription>By task type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Proofs */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Proofs Pending Review</CardTitle>
              <CardDescription>Latest submissions awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proofsLoading ? (
                  <div className="text-center py-4 text-slate-600">Loading...</div>
                ) : pendingProofs && pendingProofs.length > 0 ? (
                  pendingProofs.slice(0, 5).map((proof) => (
                    <ProofRow key={proof.id} assignment={proof} />
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-600">No pending proofs</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Withdrawals */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Pending Withdrawal Requests</CardTitle>
              <CardDescription>Awaiting admin approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {withdrawalsLoading ? (
                  <div className="text-center py-4 text-slate-600">Loading...</div>
                ) : pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                  pendingWithdrawals.slice(0, 5).map((withdrawal) => (
                    <WithdrawalRow key={withdrawal.id} withdrawal={withdrawal} />
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-600">No pending withdrawals</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ProofRow({ assignment }: { assignment: any }) {
  const reviewMutation = trpc.taskAssignments.reviewProof.useMutation();
  const utils = trpc.useUtils();
  const [busy, setBusy] = useState(false);

  const timeAgo = assignment.createdAt 
    ? new Date(assignment.createdAt).toLocaleString()
    : "Recently";

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div>
        <p className="font-medium text-slate-900">User #{assignment.userId} - Task #{assignment.taskId}</p>
        <p className="text-xs text-slate-600">Submitted {timeAgo}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={async () => {
            try {
              setBusy(true);
              await reviewMutation.mutateAsync({ 
                assignmentId: assignment.id, 
                approved: false, 
                rejectionReason: "Rejected by admin" 
              });
              await utils.taskAssignments.getPendingProofs.invalidate();
              await utils.admin.getDashboardStats.invalidate();
            } catch (e) {
              console.error(e);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Reject
        </Button>
        <Button
          size="sm"
          className="text-xs bg-green-500 hover:bg-green-600"
          onClick={async () => {
            try {
              setBusy(true);
              await reviewMutation.mutateAsync({ 
                assignmentId: assignment.id, 
                approved: true 
              });
              await utils.taskAssignments.getPendingProofs.invalidate();
              await utils.admin.getDashboardStats.invalidate();
            } catch (e) {
              console.error(e);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Approve
        </Button>
      </div>
    </div>
  );
}

function WithdrawalRow({ withdrawal }: { withdrawal: any }) {
  const approveMutation = trpc.transactions.approveWithdrawal.useMutation();
  const denyMutation = trpc.transactions.denyWithdrawal.useMutation();
  const utils = trpc.useUtils();
  const [busy, setBusy] = useState(false);

  const amount = (withdrawal.amount / 100).toFixed(2);
  const timeAgo = withdrawal.createdAt 
    ? new Date(withdrawal.createdAt).toLocaleString()
    : "Recently";

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div>
        <p className="font-medium text-slate-900">User #{withdrawal.userId} - ${amount}</p>
        <p className="text-xs text-slate-600">Requested {timeAgo}</p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={async () => {
            try {
              setBusy(true);
              await denyMutation.mutateAsync({ 
                requestId: withdrawal.id, 
                reason: "Rejected by admin" 
              });
              await utils.admin.getPendingWithdrawals.invalidate();
              await utils.admin.getDashboardStats.invalidate();
            } catch (e) {
              console.error(e);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Deny
        </Button>
        <Button
          size="sm"
          className="text-xs bg-blue-500 hover:bg-blue-600"
          onClick={async () => {
            try {
              setBusy(true);
              await approveMutation.mutateAsync({ requestId: withdrawal.id });
              await utils.admin.getPendingWithdrawals.invalidate();
              await utils.admin.getDashboardStats.invalidate();
            } catch (e) {
              console.error(e);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          Approve
        </Button>
      </div>
    </div>
  );
}
