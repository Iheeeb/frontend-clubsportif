import { useState, useEffect } from 'react';
import { userService, User } from '../services';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (data: any) => {
    try {
      const newUser = await userService.create(data);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const updateUser = async (id: string, data: any) => {
    try {
      const updatedUser = await userService.update(id, data);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}