const express = require("express");
const passport = require("passport");
const {
  authPatient,
  registerPatient,
  registerClinisist,
  authClinisist,
  verifyEmail,
  resetPassword,
  sendPasswordResetEmail,
  resendVerificationEmail,
} = require("../controllers/authController");
const router = express.Router();

router.post("/patient-register", registerPatient);
router.post("/patient-login", authPatient);
router.get("/verify/:token", verifyEmail);

router.post("/doctor-register", registerClinisist);
router.post("/doctor-login", authClinisist);
router.post("/request-password-reset", sendPasswordResetEmail);
router.post("/reset/:token", resetPassword);
router.post("/resend-verification", resendVerificationEmail);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.json({ token, user: req.user });
  },
);

// router.get(
//   "/facebook",
//   passport.authenticate("facebook", { scope: ["email"] }),
// );

// router.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { session: false }),
//   (req, res) => {
//     const token = generateToken(req.user._id);
//     res.json({ token, user: req.user });
//   },
// );

// router.get("/linkedin", passport.authenticate("linkedin"));

// router.get(
//   "/linkedin/callback",
//   passport.authenticate("linkedin", { session: false }),
//   (req, res) => {
//     const token = generateToken(req.user._id);
//     res.json({ token, user: req.user });
//   },
// );

module.exports = router;
