import express from 'express';
import bcrypt from 'bcrypt';
import db from '../config/settings.js';

const router = express.Router();
const saltRounds = 10;


export const checkBanStatus = async (req, res, next) => {
    if (!req.session.user) return next(); 
    try {
        const result = await db.query("SELECT status FROM signup WHERE id = $1", [req.session.user.id]);
        const user = result.rows[0];

        if (user && user.status === true) {
            next(); 
        } else {
           
            req.session.destroy(() => {
                res.clearCookie('connect.sid'); 
                res.redirect("/login?message=AccountDisabled");
            });
        }
    } catch (err) {
        console.error("Middleware Error:", err);
        return next(err);
    }
};

function redirectIfLoggedIn(req, res,  next) {
   if(req.session.user) {
    return res.redirect("/dashboard");
   }

   next();
}


router.get("/signup", redirectIfLoggedIn, (req, res) => {
    res.render("client/signup.ejs", { message: "" });
});

router.get("/login", redirectIfLoggedIn, (req, res) => {
    res.render("client/login.ejs", { message: "" });
});




router.post("/signup", async (req, res) => {
    const { name, email, password} = req.body;
    try {
        const checkEmail = await db.query("SELECT * FROM signup WHERE email_address = $1", [email]);
        if (checkEmail.rows.length > 0) {
            return res.render("client/signup.ejs", { message: "Email already exist" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const result = await db.query(
            "INSERT INTO signup (fullName, email_address, password, status, date) VALUES ($1, $2, $3, TRUE, NOW()) RETURNING *",
            [name, email, hashedPassword]
        );

        const newUser = result.rows[0];
        delete newUser.password;
        req.session.user = newUser;

        return res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error connecting to the server");
    }
});

// In your login route, add this:
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM signup WHERE email_address = $1", [email]);
        
        if (result.rows.length === 0) {
            return res.render("client/login.ejs", { message: "Email not found" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.render("client/login.ejs", { message: "Incorrect Password" });
        }

        if (user.status !== true) {
            return res.render("client/login.ejs", { message: "You've been banned. Please contact admin" });
        }

        // Check if user is an agent
        const agentResult = await db.query("SELECT * FROM agentdetails WHERE id = $1", [user.id]);

        delete user.password;
        req.session.user = user;

       
        if(agentResult.rows.length > 0) {
            req.session.agent = agentResult.rows[0]; 
           
        }

        return res.redirect("/dashboard");
        
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/logout", (req, res) => {
    if(req.session.user) {

    
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.clearCookie("connect.sid");
    res.redirect("/login?logout successful");
  });
} else {
    res.redirect("/login")
}
});


export default router