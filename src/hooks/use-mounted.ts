import { useEffect, useRef } from 'react';

/**
 * Hook customizado para verificar se o componente ainda está montado.
 * Previne erros de setState em componentes desmontados.
 */
export const useMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};