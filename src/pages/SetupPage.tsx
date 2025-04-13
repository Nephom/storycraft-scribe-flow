
import React, { useState, useEffect } from 'react';
import { createUser, updateSettings, isAdminCreated } from '@/services/dbService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const SetupPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  // 检查管理员是否已存在并重定向
  useEffect(() => {
    // 确保这个检查是服务器端的，不依赖于浏览器的localStorage
    if (isAdminCreated()) {
      toast({
        title: "设置已完成",
        description: "管理员账户已存在，无需重复设置",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "错误",
        description: "两次输入的密码不一致",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // 再次检查管理员是否已存在（双重检查）
      if (isAdminCreated()) {
        toast({
          title: "错误",
          description: "管理员账户已存在",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // 创建管理员用户
      const user = createUser(username, password, true);
      
      toast({
        title: "设置完成",
        description: "管理员账户已创建，正在登录...",
      });
      
      // 自动使用创建的管理员账户登录
      await login(username, password);
      
      // 重定向到首页
      navigate("/");
    } catch (error) {
      let errorMessage = "设置过程中出现错误";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "错误",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>初始化设置</CardTitle>
          <CardDescription>创建管理员账户以开始使用小说编辑器</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "处理中..." : "创建管理员账户"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SetupPage;
