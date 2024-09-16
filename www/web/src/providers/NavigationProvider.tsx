import { createContext, useState } from "react";

type NavigationContext = {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const NavigationContext = createContext<NavigationContext>({
  visible: false,
  setVisible: () => void 0,
});

export default function NavigationProvider({
  children,
}: React.PropsWithChildren) {
  const [visible, setVisible] = useState(false);
  return (
    <NavigationContext.Provider value={{ visible, setVisible }}>
      {children}
    </NavigationContext.Provider>
  );
}
