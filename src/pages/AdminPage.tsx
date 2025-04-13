
import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings, getAllUsers } from '@/services/dbService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

const AdminPage = () => {
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (!loading && (!currentUser || !isAdmin)) {
      toast({
        title: "访问被拒绝",
        description: "您没有权限访问管理页面",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Load settings and users
    const settings = getSettings();
    setAllowRegistration(settings.allowRegistration);
    setUsers(getAllUsers());
    setLoading(false);
  }, [currentUser, isAdmin, loading, navigate, toast]);

  const handleRegistrationToggle = () => {
    const newValue = !allowRegistration;
    setAllowRegistration(newValue);
    updateSettings({ allowRegistration: newValue });

    toast({
      title: "设置已更新",
      description: `用户注册已${newValue ? '开启' : '关闭'}`,
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">加载中...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">管理中心</h1>
        <Link to="/">
          <Button variant="outline">返回首页</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>系统设置</CardTitle>
            <CardDescription>配置小说编辑器的全局设置</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowRegistration">允许新用户注册</Label>
                <p className="text-sm text-muted-foreground">
                  启用后，新用户可以创建自己的账户
                </p>
              </div>
              <Switch
                id="allowRegistration"
                checked={allowRegistration}
                onCheckedChange={handleRegistrationToggle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>用户管理</CardTitle>
            <CardDescription>系统中的所有用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left font-medium">用户名</th>
                    <th className="p-4 text-left font-medium">创建日期</th>
                    <th className="p-4 text-left font-medium">类型</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="p-4">{user.username}</td>
                      <td className="p-4">{new Date(user.createdAt).toLocaleString()}</td>
                      <td className="p-4">{user.isAdmin ? "管理员" : "普通用户"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
