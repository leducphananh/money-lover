import { createContext, useContext, useState } from 'react';

interface FamilyContextType {
  activeFamilyId: string | null;
  setActiveFamilyId: (id: string | null) => void;
}

const FamilyContext = createContext<FamilyContextType>({
  activeFamilyId: null,
  setActiveFamilyId: () => {},
});

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  // Try to load from localStorage, otherwise default to null (Personal)
  const [activeFamilyId, setActiveFamilyIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('money_lover_active_family_id');
    return saved ? saved : null;
  });

  const setActiveFamilyId = (id: string | null) => {
    setActiveFamilyIdState(id);
    if (id) {
      localStorage.setItem('money_lover_active_family_id', id);
    } else {
      localStorage.removeItem('money_lover_active_family_id');
    }
  };

  return (
    <FamilyContext.Provider value={{ activeFamilyId, setActiveFamilyId }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext() {
  return useContext(FamilyContext);
}
