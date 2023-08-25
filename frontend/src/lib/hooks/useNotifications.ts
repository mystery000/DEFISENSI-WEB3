import { useEffect, useState } from 'react';

import { getNotifications } from '../api';
import { useAppContext } from '../../context/app';
import { Notification } from '../../types/notification';

export default function useNotifications() {
  const [data, setData] = useState<Notification[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAppContext();

  useEffect(() => {
    (async () => {
      try {
        if (!user.address) return;
        setLoading(true);
        const notifications = await getNotifications(user.address);
        setData(notifications || []);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
        console.error(error);
      }
    })();
  }, [user]);

  return { notifications: data, error, loading };
}
