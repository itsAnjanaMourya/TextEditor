import 'dotenv/config'
import connectDB from './config/db.js'
import express from 'express';
import cors from 'cors'
import userRouter from './routes/user.route.js';

import textRouter from './routes/textRouter.routes.js';
const app = express()
app.use(express.json())

const baseUrl = process.env.BASE_URL;
app.use(cors({ credentials: true, origin:baseUrl}))

app.use("/auth",userRouter)
app.use("/api", textRouter)


connectDB().then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running on ${process.env.PORT}`)
    })
})

import cookieParser from "cookie-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

const PORT = process.env.PORT || 8000;
app.use(cookieParser());

// Passport Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google Auth Route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign({ user: req.user }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true });
    res.redirect(process.env.BASE_URL);
  }
);

// app.get("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.redirect("/");
// });

app.post('/logout', (req, res) => {
  
   res.redirect("/");
    res.clearCookie('session'); 
    req.session.destroy(); 
    res.status(200).send({ message: 'Logged out successfully' });
});

app.get("/user", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    res.json(data.user);
  });
});

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
