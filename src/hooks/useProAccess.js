import { useAuth } from '../context/AuthContext';

export function useProAccess() {
  const { currentUser } = useAuth();
  
  if (!currentUser) return false;
  
  return currentUser.planType === 'PRO' || 
         currentUser.planType === 'PRO_PLUS' || 
         currentUser.plan === 'Pro' || 
         currentUser.plan === 'Pro Plus';
}
