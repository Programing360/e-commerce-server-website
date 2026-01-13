const helmet = require("helmet");

app.use(
  helmet({
    // React + Vite dev build এ CSP issue এড়াতে
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://www.gstatic.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://*.googleusercontent.com",
        ],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },

    // Firebase hosting + cross origin
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // iframe attack prevent
    frameguard: { action: "deny" },

    // XSS protection
    xssFilter: true,
  })
);
