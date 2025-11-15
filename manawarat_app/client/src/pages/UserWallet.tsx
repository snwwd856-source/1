import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, Send, Plus, History } from "lucide-react";
import { useState } from "react";

export default function UserWallet() {
  const [showWithdrawal, setShowWithdrawal] = useState(false);

  const transactions = [
    {
      id: 1,
      type: "credit",
      description: "Task Completion - Survey",
      amount: 5.00,
      date: "2024-01-20",
      status: "completed",
    },
    {
      id: 2,
      type: "debit",
      description: "Withdrawal Request",
      amount: 50.00,
      date: "2024-01-19",
      status: "completed",
    },
    {
      id: 3,
      type: "credit",
      description: "Referral Bonus",
      amount: 10.00,
      date: "2024-01-18",
      status: "completed",
    },
    {
      id: 4,
      type: "credit",
      description: "Task Completion - Marketing",
      amount: 2.50,
      date: "2024-01-17",
      status: "completed",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold gradient-text">My Wallet</h1>
        </div>
      </div>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <CardContent className="pt-8 text-white">
              <p className="text-sm opacity-90 mb-2">Total Balance</p>
              <h2 className="text-4xl font-bold mb-8">$127.50</h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-xs opacity-75 mb-1">Available</p>
                  <p className="text-2xl font-bold">$127.50</p>
                </div>
                <div>
                  <p className="text-xs opacity-75 mb-1">Pending</p>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-white text-blue-600 hover:bg-slate-100">
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  onClick={() => setShowWithdrawal(!showWithdrawal)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-green-600">+$47.50</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Withdrawn</p>
                <p className="text-2xl font-bold">$50.00</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Level Bonus</p>
                <p className="text-2xl font-bold text-purple-600">15%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Form */}
        {showWithdrawal && (
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>Withdraw your earnings to your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="10"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-slate-600 mt-1">Minimum withdrawal: $10.00</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Wallet Address</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>USDT (TRC20) - TQn9jFHHhg5SNtBTgcAcNryWgSG1i63hum</option>
                    <option>USDC (TRC20) - TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Processing time:</strong> 24-48 hours. A fee of 2% will be deducted.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    Request Withdrawal
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Your recent wallet activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        tx.type === "credit" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className={`h-4 w-4 ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`} />
                      ) : (
                        <ArrowUpRight className={`h-4 w-4 ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{tx.description}</p>
                      <p className="text-xs text-slate-600">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        tx.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </p>
                    <span className="text-xs text-slate-600 capitalize">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
