const User = require("../models/user");

module.exports.signUpPage = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUpRequest = async (req, res) => {
    try {

        let { username, email, password, role } = req.body;
        const newUser = new User({ email, username, role });
        const reg = await User.register(newUser, password);
        req.login(reg, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", `Welcome ${username} to Explorer!`);
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
};

module.exports.loginPage = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.loginRequest = async (req, res) => {
    req.flash("success", "Welcome back to Explorer! You logged in.");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Successfully! logged out");
        res.redirect("/listings");
    })
};