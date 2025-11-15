import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ManageProofs() {
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: proofs, isLoading, refetch } = trpc.taskAssignments.getPendingProofs.useQuery();
  const utils = trpc.useUtils();

  const reviewMutation = trpc.taskAssignments.reviewProof.useMutation({
    onSuccess: () => {
      toast.success("Proof reviewed successfully");
      setSelectedProof(null);
      setRejectionReason("");
      refetch();
      utils.admin.getDashboardStats.invalidate();
    },
  });

  const handleApprove = (assignmentId: number) => {
    if (confirm("Are you sure you want to approve this proof?")) {
      reviewMutation.mutate({ assignmentId, approved: true });
    }
  };

  const handleReject = (assignmentId: number) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    if (confirm("Are you sure you want to reject this proof?")) {
      reviewMutation.mutate({
        assignmentId,
        approved: false,
        rejectionReason: rejectionReason,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "proof_pending":
        return "bg-blue-100 text-blue-700";
      case "approved":
        return "bg-purple-100 text-purple-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">Manage Proofs</h1>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-600" />
            <span className="text-sm text-slate-600">
              {proofs?.length || 0} pending review
            </span>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Pending Proofs</CardTitle>
            <CardDescription>Review and approve or reject task completion proofs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : proofs && proofs.length > 0 ? (
              <div className="space-y-4">
                {proofs.map((proof: any) => (
                  <Card key={proof.id} className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Task #{proof.taskId}
                            </span>
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                              User #{proof.userId}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                              {proof.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            Submitted: {new Date(proof.createdAt).toLocaleString()}
                          </p>
                          {proof.proofUrl && (
                            <div className="mb-3">
                              <a
                                href={proof.proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Proof (Link)
                              </a>
                            </div>
                          )}
                          {proof.proofText && (
                            <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm text-slate-900">{proof.proofText}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => setSelectedProof(proof)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => handleApprove(proof.id)}
                            disabled={reviewMutation.isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedProof(proof);
                              setRejectionReason("");
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-slate-600">No pending proofs to review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* View Details Dialog */}
      {selectedProof && (
        <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Proof Details</DialogTitle>
              <DialogDescription>Review proof submission for Task #{selectedProof.taskId}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">User ID</p>
                <p className="text-sm text-slate-600">#{selectedProof.userId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Task ID</p>
                <p className="text-sm text-slate-600">#{selectedProof.taskId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 mb-1">Submitted At</p>
                <p className="text-sm text-slate-600">
                  {new Date(selectedProof.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedProof.proofUrl && (
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Proof URL</p>
                  <a
                    href={selectedProof.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {selectedProof.proofUrl}
                  </a>
                </div>
              )}
              {selectedProof.proofText && (
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Proof Text</p>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedProof.proofText}</p>
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Rejection Reason (if rejecting)</p>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white flex-1"
                  onClick={() => handleApprove(selectedProof.id)}
                  disabled={reviewMutation.isLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 flex-1"
                  onClick={() => handleReject(selectedProof.id)}
                  disabled={reviewMutation.isLoading || !rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

