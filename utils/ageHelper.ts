export const calculateAge = () => {
  const now = new Date();
  const birthday = new Date(Date.UTC(1990, 6, 26));
  const beforeBirthday = now.getUTCMonth() < birthday.getUTCMonth()
    || (now.getUTCMonth() === birthday.getUTCMonth() && now.getUTCDate() < birthday.getUTCDate());
  return now.getUTCFullYear() - birthday.getUTCFullYear() - (beforeBirthday ? 1 : 0);
};
