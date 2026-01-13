const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        // We don't create sessions here; we just pass through the verified profile
        async (accessToken, refreshToken, profile, done) => {
            // profile.id is the Google "sub"-equivalent for this strategy
            return done(null, {
                provider: "google",
                sub: profile.id,
                picture: profile.photos[0]?.value,
            });
        }
    )
);