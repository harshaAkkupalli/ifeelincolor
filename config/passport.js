const mongoose = require("mongoose");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const passport = require("passport");

const localOptions = { usernameField: "email" };
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const Patient = require("../models/patient");

passport.use(
  new LocalStrategy(localOptions, async (email, password, done) => {
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return done(null, false, { message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        return done(null, false, { message: "Invalid credentials" });
      }

      return done(null, admin);
    } catch (err) {
      return done(err, false);
    }
  }),
);

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const admin = await Admin.findById(payload.id);

      if (admin) {
        return done(null, admin);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }),
);

passport.serializeUser((admin, done) => {
  done(null, admin._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const admin = await Admin.findById(id);
    done(null, admin);
  } catch (err) {
    done(err, false);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://www.ifeelincolor.projexino.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await Patient.findOne({ googleId: profile.id });

        if (user) return done(null, user);

        const email = profile.emails[0].value;

        user = await Patient.findOne({ email });

        if (user) {
          user.googleId = profile.id;
          user.authProvider = "google";
          await user.save();
          return done(null, user);
        }

        const newUser = await Patient.create({
          userName: profile.displayName,
          email,
          googleId: profile.id,
          authProvider: "google",
          verified: "yes",
        });

        done(null, newUser);
      } catch (err) {
        done(err, false);
      }
    },
  ),
);

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "/api/auth/facebook/callback",
//       profileFields: ["id", "emails", "name"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await Patient.findOne({ facebookId: profile.id });

//         if (user) return done(null, user);

//         const email = profile.emails?.[0]?.value;

//         user = await Patient.findOne({ email });

//         if (user) {
//           user.facebookId = profile.id;
//           user.authProvider = "facebook";
//           await user.save();
//           return done(null, user);
//         }

//         const newUser = await Patient.create({
//           userName: profile.name.givenName,
//           email,
//           facebookId: profile.id,
//           authProvider: "facebook",
//           verified: "yes",
//         });

//         done(null, newUser);
//       } catch (err) {
//         done(err, false);
//       }
//     },
//   ),
// );

// passport.use(
//   new LinkedInStrategy(
//     {
//       clientID: process.env.LINKEDIN_CLIENT_ID,
//       clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
//       callbackURL: "/api/auth/linkedin/callback",
//       scope: ["r_emailaddress", "r_liteprofile"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await Patient.findOne({ linkedinId: profile.id });

//         if (user) return done(null, user);

//         const email = profile.emails?.[0]?.value;

//         user = await Patient.findOne({ email });

//         if (user) {
//           user.linkedinId = profile.id;
//           user.authProvider = "linkedin";
//           await user.save();
//           return done(null, user);
//         }

//         const newUser = await Patient.create({
//           userName: profile.displayName,
//           email,
//           linkedinId: profile.id,
//           authProvider: "linkedin",
//           verified: "yes",
//         });

//         done(null, newUser);
//       } catch (err) {
//         done(err, false);
//       }
//     },
//   ),
// );
