import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ManageTasks() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "manual" as const,
    rewardUsd: "",
    eligibilityLevel: "0",
    slots: "",
    timeLimitMinutes: "",
    proofType: "image" as const,
    repeatable: false,
  });

  const { data: tasks, isLoading, refetch } = trpc.tasks.list.useQuery({
    status: "active",
  });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully");
      setShowCreateForm(false);
      resetForm();
      refetch();
    },
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated successfully");
      setEditingTask(null);
      resetForm();
      refetch();
    },
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted successfully");
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "manual",
      rewardUsd: "",
      eligibilityLevel: "0",
      slots: "",
      timeLimitMinutes: "",
      proofType: "image",
      repeatable: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        title: formData.title || undefined,
        description: formData.description || undefined,
        rewardUsd: formData.rewardUsd ? parseFloat(formData.rewardUsd) : undefined,
      });
    } else {
      createMutation.mutate({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        rewardUsd: parseFloat(formData.rewardUsd),
        eligibilityLevel: parseInt(formData.eligibilityLevel),
        slots: formData.slots ? parseInt(formData.slots) : undefined,
        timeLimitMinutes: formData.timeLimitMinutes ? parseInt(formData.timeLimitMinutes) : undefined,
        proofType: formData.proofType,
        repeatable: formData.repeatable,
      });
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      type: task.type || "manual",
      rewardUsd: ((task.rewardUsd || 0) / 100).toString(),
      eligibilityLevel: (task.eligibilityLevel || 0).toString(),
      slots: (task.slots || "").toString(),
      timeLimitMinutes: task.timeLimitMinutes?.toString() || "",
      proofType: task.proofType || "image",
      repeatable: task.repeatable || false,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">Manage Tasks</h1>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            onClick={() => {
              resetForm();
              setEditingTask(null);
              setShowCreateForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      <main className="container py-8">
        {showCreateForm && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>{editingTask ? "Edit Task" : "Create New Task"}</CardTitle>
              <CardDescription>Add a new task to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Title</label>
                    <Input
                      type="text"
                      placeholder="Task title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Type</label>
                    <Select
                      value={formData.type}
                      onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trading">Trading</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="survey">Survey</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Reward (USD)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.rewardUsd}
                      onChange={(e) => setFormData({ ...formData, rewardUsd: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Eligibility Level</label>
                    <Select
                      value={formData.eligibilityLevel}
                      onValueChange={(val) => setFormData({ ...formData, eligibilityLevel: val })}
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
                    <label className="block text-sm font-medium text-slate-900 mb-1">Slots</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.slots}
                      onChange={(e) => setFormData({ ...formData, slots: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Time Limit (minutes)</label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={formData.timeLimitMinutes}
                      onChange={(e) => setFormData({ ...formData, timeLimitMinutes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">Proof Type</label>
                    <Select
                      value={formData.proofType}
                      onValueChange={(val: any) => setFormData({ ...formData, proofType: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Description</label>
                  <Textarea
                    placeholder="Task description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="repeatable"
                    checked={formData.repeatable}
                    onChange={(e) => setFormData({ ...formData, repeatable: e.target.checked })}
                  />
                  <label htmlFor="repeatable" className="text-sm font-medium">
                    Repeatable task
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    {editingTask ? "Update Task" : "Create Task"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                      setEditingTask(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Manage all platform tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Reward</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Progress</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks?.map((task: any) => (
                      <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-900 font-medium">{task.title}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {task.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-900">${((task.rewardUsd || 0) / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${((task.activeSlots || 0) / (task.slots || 1)) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-600">
                              {task.activeSlots || 0}/{task.slots || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-slate-600 hover:text-slate-700"
                              onClick={() => handleEdit(task)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
    </div>
  );
}
