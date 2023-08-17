import { useEffect, useState } from 'react';

export default function useTopWallets() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {})();
  }, []);

  return [data, error, loading];
}
