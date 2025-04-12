import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  saveRadiusSettings, 
  isRadiusConfigured, 
  addRadiusUser,
  initializeRadiusService,
  clearRadiusConfiguration,
  setGlobalRadiusConfigured
} from '@/services/radiusService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle } from 'lucide-react';

const RadiusSetup = () => {
  const [serverUrl, setServerUrl] = useState('localhost');
  const [serverPort, setServerPort] = useState('1812');
  const [sharedSecret, setSharedSecret] = useState('');
  const [testUsername, setTestUsername] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isGlobalCheck, setIsGlobalCheck] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      await initializeRadiusService();
      const configured = isRadiusConfigured();
      setIsConfigured(configured);
      setIsChecking(false);
      
      if (configured && isGlobalCheck) {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    };
    
    checkStatus();
  }, [navigate, isGlobalCheck]);
  
  if (isChecking) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-600">正在檢查RADIUS配置狀態...</p>
      </div>
    );
  }
  
  if (isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              RADIUS 已配置
            </CardTitle>
            <CardDescription>RADIUS服務已經配置完成，无需重新设置</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-gray-600 mb-4">系統检测到RADIUS服务已经配置完成，将自动跳转到主页。</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              立即前往主页
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!serverUrl || !serverPort || !sharedSecret) {
        toast({
          variant: "destructive",
          title: "錯誤",
          description: "請填寫所有RADIUS伺服器設定欄位",
        });
        setIsSubmitting(false);
        return;
      }

      if (!testUsername || !testPassword) {
        toast({
          variant: "destructive",
          title: "錯誤",
          description: "請提供測試用戶資訊",
        });
        setIsSubmitting(false);
        return;
      }

      saveRadiusSettings({
        serverUrl,
        serverPort: parseInt(serverPort),
        sharedSecret,
        adminUsers: isAdmin ? [testUsername] : [],
        isConfigured: true,
        setupDate: new Date().toISOString()
      });

      addRadiusUser(testUsername, testPassword);
      
      setGlobalRadiusConfigured(true);

      toast({
        title: "成功",
        description: "RADIUS設定已保存，系統已準備就緒",
      });

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('設定RADIUS時發生錯誤:', error);
      toast({
        variant: "destructive",
        title: "錯誤",
        description: "設定RADIUS時發生錯誤",
      });
      setIsSubmitting(false);
    }
  };

  const handleClearConfig = () => {
    clearRadiusConfiguration();
    toast({
      title: "已清除",
      description: "已清除所有RADIUS配置，可以重新配置",
    });
    setIsConfigured(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>RADIUS 認證設定</CardTitle>
          <CardDescription>請配置RADIUS伺服器連接設定</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="server-url">伺服器地址</Label>
              <Input
                id="server-url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="例如: radius.example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="server-port">伺服器端口</Label>
              <Input
                id="server-port"
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value)}
                placeholder="例如: 1812"
                type="number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shared-secret">共享密鑰</Label>
              <Input
                id="shared-secret"
                type="password"
                value={sharedSecret}
                onChange={(e) => setSharedSecret(e.target.value)}
                placeholder="輸入RADIUS共享密鑰"
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">測試用戶</h3>
              <p className="text-sm text-muted-foreground mb-4">
                在演示環境中添加一個測試用戶進行認證
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="test-username">用戶名</Label>
                <Input
                  id="test-username"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                  placeholder="測試用戶名"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="test-password">密碼</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="測試密碼"
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id="is-admin" 
                  checked={isAdmin} 
                  onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
                />
                <Label htmlFor="is-admin">授予管理員權限</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '處理中...' : '保存並繼續'}
            </Button>
            
            {import.meta.env.DEV && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full mt-2" 
                onClick={handleClearConfig}
              >
                清除配置（僅用于測試）
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default RadiusSetup;
