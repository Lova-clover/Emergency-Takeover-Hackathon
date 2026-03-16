"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface UserContextProps {
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  myTeamId: string | null;
  joinTeam: (teamId: string) => void;
  leaveTeam: () => void;
  isHydrated: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load from local storage
    const storedBookmarks = localStorage.getItem("daker_bookmarks");
    if (storedBookmarks) {
      try {
        setBookmarks(JSON.parse(storedBookmarks));
      } catch (e) {}
    }

    const storedTeam = localStorage.getItem("daker_myTeam");
    if (storedTeam) {
      setMyTeamId(storedTeam);
    }
    
    setIsHydrated(true);
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(id);
      const newBookmarks = isBookmarked ? prev.filter(b => b !== id) : [...prev, id];
      localStorage.setItem("daker_bookmarks", JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const joinTeam = (teamId: string) => {
    setMyTeamId(teamId);
    localStorage.setItem("daker_myTeam", teamId);
  };

  const leaveTeam = () => {
    setMyTeamId(null);
    localStorage.removeItem("daker_myTeam");
  };

  return (
    <UserContext.Provider value={{ bookmarks, toggleBookmark, myTeamId, joinTeam, leaveTeam, isHydrated }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
