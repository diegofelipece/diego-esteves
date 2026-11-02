import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { ageInfo } from '../utils/ageHelper';

const ProfileDate = createContext<ReturnType<typeof ageInfo> | null>(null);

export function ProfileDateProvider({ renderedAt, children }: { renderedAt?: string; children: ReactNode }) {
  const [info, setInfo] = useState(() => {
    const snapshot = ageInfo(renderedAt ? new Date(renderedAt) : new Date(), true);
    return { ...snapshot, birthday: false };
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refresh() {
      clearTimeout(timer);
      const now = new Date();
      const next = ageInfo(now);
      setInfo((previous) => previous.age === next.age && previous.birthday === next.birthday ? previous : next);
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refresh, midnight.getTime() - now.getTime());
    }
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') refresh();
    }
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return <ProfileDate.Provider value={info}>{children}</ProfileDate.Provider>;
}

export function useProfileDate() {
  const info = useContext(ProfileDate);
  if (!info) throw new Error('Age content requires a ProfileDateProvider.');
  return info;
}

export function interpolateContent(text = '', info: ReturnType<typeof ageInfo>) {
  return text.replaceAll('{{age}}', String(info.age)).replaceAll('{{birthday}}', info.birthday ? ' (today 🎈)' : '');
}
