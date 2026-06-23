"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/auth-guard";
import { Shield, Users, FileText, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [content, setContent] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    if (user?.role === "ADMIN") {
      api.getAdminOverview().then(setOverview).catch(() => {});
      api.getAdminUsers().then(setUsers).catch(() => {});
      api.getAdminContent().then(setContent).catch(() => {});
    }
  }, [user, router]);

  const stats = overview?.stats as Record<string, number> | undefined;
  const contentByStatus = overview?.contentByStatus as Record<string, number> | undefined;
  const upcomingPosts = (overview?.upcomingPosts as Array<Record<string, unknown>>) || [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">System overview, content status, and posting schedule</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats &&
            Object.entries(stats).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500 capitalize">{key}</p>
                  <p className="text-3xl font-bold mt-1">{value}</p>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content by Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contentByStatus &&
                Object.entries(contentByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <Badge variant="secondary">{status}</Badge>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {upcomingPosts.map((post) => (
                <div key={post.id as string} className="p-2 rounded bg-slate-50 text-sm">
                  <p className="font-medium">
                    {(post.contentItem as Record<string, string>)?.title}
                  </p>
                  <p className="text-slate-500">
                    {(post.channel as Record<string, string>)?.name} · {formatDateTime(post.scheduledAt as string)}
                  </p>
                </div>
              ))}
              {!upcomingPosts.length && <p className="text-sm text-slate-500">No upcoming posts</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Channels</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id as string} className="border-b">
                      <td className="py-2">{u.email as string}</td>
                      <td>{(u.name as string) || "—"}</td>
                      <td><Badge variant="secondary">{u.role as string}</Badge></td>
                      <td>{((u._count as Record<string, number>)?.channels) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {content.map((item) => (
                <div key={item.id as string} className="flex items-center justify-between p-3 rounded bg-slate-50">
                  <div>
                    <p className="font-medium text-sm">{item.title as string}</p>
                    <p className="text-xs text-slate-500">
                      {(item.channel as Record<string, string>)?.name} · {(item.channel as Record<string, string>)?.niche}
                    </p>
                  </div>
                  <Badge>{item.status as string}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
