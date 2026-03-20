const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerValidation = (data) => {
  const { username, email, password } = data || {};

  if (!username || !email || !password) {
    return { error: "Username, email and password are required" };
  }

  if (String(username).trim().length < 2) {
    return { error: "Username must be at least 2 characters" };
  }

  if (!emailRegex.test(String(email).toLowerCase().trim())) {
    return { error: "Please provide a valid email" };
  }

  if (String(password).length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  return { error: null };
};

const loginValidation = (data) => {
  const { email, password } = data || {};

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (!emailRegex.test(String(email).toLowerCase().trim())) {
    return { error: "Please provide a valid email" };
  }

  return { error: null };
};

module.exports = {
  registerValidation,
  loginValidation,
};
