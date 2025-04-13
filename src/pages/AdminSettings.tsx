
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { updateAllowRegistration, getAllowRegistration } from '@/services/authService';
import { Settings, Users, Shield } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [allowRegistration, setAllowRegistration] = useState(true);
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in and is admin
    if (!isLoading && (!currentUser || !currentUser.isAdmin)) {
      navigate('/login');
    }
    
    // Load current settings
    setAllowRegistration(getAllowRegistration());
  }, [currentUser, isLoading, navigate]);

  const handleToggleRegistration = () => {
    const newValue = !allowRegistration;
    setAllowRegistration(newValue);
    updateAllowRegistration(newValue);
    
    toast({
      title: "设置已更新",
      description: `用户注册功能已${newValue ? '开启' : '关闭'}`,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-8 gap-3">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">管理员设置</h1>
      </div>
      
      <Tabs defaultValue="general" className="w-full max-w-3xl mx-auto">
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            一般设置
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            用户管理
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>系统设置</CardTitle>
              <CardDescription>
                配置系统的基本功能和权限
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium">允许用户注册</h3>
                  <p className="text-sm text-muted-foreground">
                    启用后，新用户可以自行注册账号
                  </p>
                </div>
                <Switch 
                  checked={allowRegistration} 
                  onCheckedChange={handleToggleRegistration} 
                />
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => navigate('/')}>
                  返回首页
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>
                管理系统用户及其权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  此功能正在开发中，敬请期待
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
