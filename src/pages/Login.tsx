
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Book, Eye } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, continueAsGuest, isGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user is already logged in or in guest mode, redirect to home
  React.useEffect(() => {
    if (isAuthenticated || isGuest) {
      navigate('/');
    }
  }, [isAuthenticated, isGuest, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(username, password)) {
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate('/');
    } else {
      toast({
        title: "登录失败",
        description: "用户名至少3个字符，密码至少6个字符",
        variant: "destructive",
      });
    }
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    toast({
      title: "访客模式",
      description: "您现在可以浏览内容，但无法编辑。",
    });
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Book className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">登录到小说编辑器</CardTitle>
          <CardDescription>
            请输入您的用户凭据以访问您的小说
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input 
                id="username"
                placeholder="输入用户名" 
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
                placeholder="输入密码" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full">登录</Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGuestAccess}
            >
              <Eye className="mr-2 h-4 w-4" />
              以访客模式浏览
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
