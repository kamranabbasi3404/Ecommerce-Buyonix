export const GoogleAuth = () => {
  window.open("http://localhost:5000/auth/google", "_self");
};

export const checkAuthStatus = async () => {
  try {
    const response = await fetch("http://localhost:5000/auth/login/success", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    
    if (response.status === 200) {
      const userData = await response.json();
      return userData;
    }
    throw new Error("Authentication failed");
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
};

export const logout = () => {
  window.open("http://localhost:5000/auth/logout", "_self");
};