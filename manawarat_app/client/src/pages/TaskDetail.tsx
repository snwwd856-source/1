import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, DollarSign, Users, Upload, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function TaskDetail() {
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [proofType, setProofType] = useState("file");

  const task = {
    id: 1,
    title: "Complete Survey on Market Research",
    description: "Help us understand market trends by completing a 10-minute survey about your shopping habits.",
    type: "survey",
    reward: 5.00,
    eligibilityLevel: 0,
    slots: 100,
    activeSlots: 45,
    timeLimit: 60,
    proofType: "link",
    repeatable: false,
    status: "active",
    createdDate: "2024-01-15",
    instructions: "1. Click the link below\n2. Complete the survey\n3. Submit your proof link\n4. Wait for approval",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold gradient-text">Task Details</h1>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{task.title}</CardTitle>
                    <CardDescription className="text-base">{task.description}</CardDescription>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {task.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Reward</p>
                    <p className="text-2xl font-bold text-primary">${task.reward.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Time Limit</p>
                    <p className="text-2xl font-bold text-secondary">{task.timeLimit}m</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Slots Left</p>
                    <p className="text-2xl font-bold text-accent">{task.slots - task.activeSlots}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Min Level</p>
                    <p className="text-2xl font-bold">Level {task.eligibilityLevel}+</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-slate-700">
                  {task.instructions.split("\n").map((line, i) => (
                    <p key={i} className="flex items-start gap-3">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span>{line.replace(/^\d+\.\s/, "")}</span>
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Proof Submission */}
            {!proofSubmitted ? (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Submit Proof</CardTitle>
                  <CardDescription>Provide evidence that you completed the task</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">Proof Type</label>
                    <select
                      value={proofType}
                      onChange={(e) => setProofType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="link">Link</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  {proofType === "link" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Proof Link</label>
                      <input
                        type="url"
                        placeholder="https://example.com/proof"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}

                  {proofType === "image" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Upload Image</label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}

                  {proofType === "text" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">Description</label>
                      <textarea
                        placeholder="Describe how you completed the task..."
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    onClick={() => setProofSubmitted(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Proof
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-lg bg-green-50 border-2 border-green-200">
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Proof Submitted Successfully!</h3>
                  <p className="text-green-700 mb-4">Your proof is now under review. You'll be notified once it's approved.</p>
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                    View Submission Status
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-lg sticky top-20">
              <CardHeader>
                <CardTitle>Task Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants
                  </span>
                  <span className="font-bold">{task.activeSlots}/{task.slots}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(task.activeSlots / task.slots) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Remaining
                  </span>
                  <span className="font-bold text-orange-600">45m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Reward Pool
                  </span>
                  <span className="font-bold text-green-600">${(task.reward * task.slots).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Task Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Task Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600 mb-1">Type</p>
                  <p className="font-medium text-slate-900 capitalize">{task.type}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Proof Type</p>
                  <p className="font-medium text-slate-900 capitalize">{task.proofType}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Repeatable</p>
                  <p className="font-medium text-slate-900">{task.repeatable ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Created</p>
                  <p className="font-medium text-slate-900">{task.createdDate}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
