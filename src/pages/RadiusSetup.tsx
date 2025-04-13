
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { configureRadius, isRadiusConfigured } from '@/services/authService';

const RadiusSetup: React.FC = () => {
  const [server, setServer] = useState('');
  const [port, setPort] = useState('1812');
  const [secret, setSecret] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // If RADIUS is already configured, redirect to login
    if (isRadiusConfigured()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfiguring(true);
    
    // Validate inputs
    if (!server || !port || !secret) {
      toast({
        title: "错误",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      setIsConfiguring(false);
      return;
    }
    
    // Configure RADIUS
    const success = configureRadius({
      server,
      port: parseInt(port, 10),
      secret,
      enabled: true
    });
    
    if (success) {
      toast({
        title: "RADIUS配置成功",
        description: "RADIUS服务器已成功配置",
      });
      navigate('/login');
    } else {
      toast({
        title: "配置失败",
        description: "无法连接到RADIUS服务器，请检查配置",
        variant: "destructive",
      });
    }
    
    setIsConfiguring(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>RADIUS服务器配置</CardTitle>
          <CardDescription>
            首次使用时，需要配置RADIUS服务器以进行用户认证
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="server" className="text-sm font-medium">服务器地址</label>
              <Input 
                id="server" 
                placeholder="例如: radius.example.com" 
                value={server}
                onChange={(e) => setServer(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="port" className="text-sm font-medium">端口号</label>
              <Input 
                id="port" 
                placeholder="默认: 1812" 
                value={port}
                onChange={(e) => setPort(e.target.value)}
                required
                type="number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="secret" className="text-sm font-medium">共享密钥</label>
              <Input 
                id="secret" 
                type="password" 
                placeholder="RADIUS共享密钥" 
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isConfiguring}>
              {isConfiguring ? "配置中..." : "保存配置"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RadiusSetup;
