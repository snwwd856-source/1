import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, DollarSign, Copy, Check } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ReferralTree() {
  const { user } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: referralStats } = trpc.user.getReferralStats.useQuery();
  const { data: referralCode } = trpc.user.getReferralCode.useQuery();

  const toggleNode = (userId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedNodes(newExpanded);
  };

  const copyReferralCode = () => {
    if (referralCode?.referralCode) {
      navigator.clipboard.writeText(referralCode.referralCode);
      setCopiedCode(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">Referral Network</h1>
        </div>
      </div>

      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{referralStats?.totalReferrals || 0}</div>
              <p className="text-xs text-slate-600 mt-1">All time referrals</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Active Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{referralStats?.activeReferrals || 0}</div>
              <p className="text-xs text-slate-600 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-500" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(referralStats?.totalEarnings || 0).toFixed(2)}
              </div>
              <p className="text-xs text-slate-600 mt-1">From referrals</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this code with others to earn referral rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 bg-slate-50 rounded-lg">
                <p className="font-mono text-lg font-bold text-slate-900">
                  {referralCode?.referralCode || "Loading..."}
                </p>
              </div>
              <Button
                onClick={copyReferralCode}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Referral Tree</CardTitle>
            <CardDescription>Visual representation of your referral network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8">
              <ReferralTreeNode
                userId={user?.id || 0}
                username={user?.username || "You"}
                level={0}
                expandedNodes={expandedNodes}
                onToggle={toggleNode}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ReferralTreeNode({
  userId,
  username,
  level,
  expandedNodes,
  onToggle,
}: {
  userId: number;
  username: string;
  level: number;
  expandedNodes: Set<number>;
  onToggle: (userId: number) => void;
}) {
  const isExpanded = expandedNodes.has(userId);
  const maxLevel = 3; // Limit tree depth for performance

  if (level > maxLevel) return null;

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
          level === 0
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-600"
            : "bg-white border-slate-200 hover:border-slate-300"
        } cursor-pointer transition-all mb-4`}
        onClick={() => onToggle(userId)}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          level === 0 ? "bg-white text-cyan-500" : "bg-slate-100 text-slate-700"
        }`}>
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${level === 0 ? "text-white" : "text-slate-900"}`}>
            {username}
          </p>
          <p className={`text-xs ${level === 0 ? "text-cyan-100" : "text-slate-600"}`}>
            Level {level} • User ID: {userId}
          </p>
        </div>
        {level < maxLevel && (
          <div className={`text-sm ${level === 0 ? "text-white" : "text-slate-600"}`}>
            {isExpanded ? "▼" : "▶"}
          </div>
        )}
      </div>

      {isExpanded && level < maxLevel && (
        <div className="ml-8 border-l-2 border-slate-200 pl-4">
          {/* Mock child nodes - In production, fetch from API */}
          {[1, 2, 3].map((i) => (
            <ReferralTreeNode
              key={i}
              userId={userId * 10 + i}
              username={`User${userId * 10 + i}`}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

