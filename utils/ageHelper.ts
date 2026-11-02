import profile from '../content/profile/diego-esteves.json' with { type: 'json' };

export function ageInfo(now = new Date(), utc = false) {
  const [birthYear, birthMonth, birthDay] = profile.basics.birthDate.split('-').map(Number);
  const year = utc ? now.getUTCFullYear() : now.getFullYear();
  const month = (utc ? now.getUTCMonth() : now.getMonth()) + 1;
  const day = utc ? now.getUTCDate() : now.getDate();
  const beforeBirthday = month < birthMonth || (month === birthMonth && day < birthDay);
  return {
    age: year - birthYear - (beforeBirthday ? 1 : 0),
    birthday: month === birthMonth && day === birthDay,
  };
}
