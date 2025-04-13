
import React, { useState, useEffect } from 'react';
import { getAllUsers } from '@/services/dbService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

const UserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    // Load users
    setUsers(getAllUsers());
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">小说编辑器</h1>
        <div className="flex gap-2">
          {currentUser ? (
            <>
              <span className="flex items-center mr-4 text-sm">
                <UserIcon className="h-4 w-4 mr-1" />
                {currentUser.username}
              </span>
              {currentUser.isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">管理中心</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                退出
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button>
                <LogIn className="h-4 w-4 mr-1" />
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                {user.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                加入时间: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter>
              <Link to={`/editor/${user.id}`} className="w-full">
                <Button className="w-full">
                  {currentUser && currentUser.id === user.id ? "编辑作品" : "查看作品"}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserListPage;
