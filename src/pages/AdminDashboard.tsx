
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const { user, users } = useAuth();
  const { settings, updateSettings } = useAdmin();
  const { toast } = useToast();

  // If user is not an admin, redirect to home
  if (!user?.isAdmin) {
    return <Navigate to="/" />;
  }

  const toggleRegistration = () => {
    const newValue = !settings.allowRegistration;
    updateSettings({ allowRegistration: newValue });
    
    toast({
      title: "Settings Updated",
      description: `User registration is now ${newValue ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-8">
        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Registration Settings</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Allow User Registration</h3>
              <p className="text-sm text-gray-500">
                When disabled, new users cannot register accounts
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="registration-toggle"
                checked={settings.allowRegistration}
                onCheckedChange={toggleRegistration}
              />
              <Label htmlFor="registration-toggle">
                {settings.allowRegistration ? 'Enabled' : 'Disabled'}
              </Label>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-sm text-gray-500 mb-4">
            Total users: {users.length}
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3 text-left">Username</th>
                  <th className="py-2 px-3 text-left">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.username || index} className="border-b">
                    <td className="py-2 px-3">{user.username}</td>
                    <td className="py-2 px-3">{user.isAdmin ? 'Admin' : 'User'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
