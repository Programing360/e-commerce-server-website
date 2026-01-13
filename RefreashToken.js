export const RefrashToken = (user) => {
  const accessToken = jwt.sign(
    user,
    process.env.JWT_ACCESS,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    user,
    process.env.JWT_REFRESH,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
