import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Rola para o topo da página toda vez que a rota (pathname) muda
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Este componente não renderiza nada na tela
}
