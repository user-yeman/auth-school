// This function updates the sessionStorage with the most recent login time.
export function updateSessionLoginTime(newLoginTime: string): string {
  if (!newLoginTime) {
    return sessionStorage.getItem('lastLoginTime') || '';
  }
  
  const sessionLogin = sessionStorage.getItem('lastLoginTime');
  let mostRecentLogin = newLoginTime;
  
  // Compare dates to use the most recent one
  if (sessionLogin) {
    try {
      const newDate = new Date(newLoginTime);
      const sessionDate = new Date(sessionLogin);
      
      // Use the more recent date
      if (!isNaN(newDate.getTime()) && !isNaN(sessionDate.getTime())) {
        mostRecentLogin = newDate > sessionDate ? newLoginTime : sessionLogin;
      }
    } catch (e) {
      console.error('Error comparing dates:', e);
    }
  }
  
  // Always save the most recent value
  sessionStorage.setItem('lastLoginTime', mostRecentLogin);
  console.log('Updated sessionStorage with login time:', mostRecentLogin);
  
  // Clean up localStorage if needed
  if (localStorage.getItem('lastLoginTime')) {
    localStorage.removeItem('lastLoginTime');
  }
  
  return mostRecentLogin;
}