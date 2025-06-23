// Should've just used tanstack router...
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const RouterContext = createContext<{
  path: string;
  searchParams: URLSearchParams;
  navigate: (path: string, search?: Record<string, string>) => void;
}>({
  path: window.location.pathname,
  searchParams: new URLSearchParams(window.location.search),
  navigate: () => {},
});

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(window.location.search),
  );

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (newPath: string, search?: Record<string, string>) => {
    const params = new URLSearchParams(search || {});
    const url = `${newPath}${params.toString() ? `?${params}` : ""}`;
    window.history.pushState({}, "", url);
    setPath(newPath);
    setSearchParams(params);
  };

  return (
    <RouterContext.Provider value={{ path, searchParams, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function usePath() {
  return useContext(RouterContext).path;
}

export function useSearchParams() {
  return useContext(RouterContext).searchParams;
}
