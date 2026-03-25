import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../config/settings.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();


router.get("/admin", (req, res) => {
  
  res.render("admin/form/login.ejs")
});

function redirectIfLoggedIn(req, res,  next) {
      if(req.session && req.session.admin) { 
        return res.redirect("/admin/dashboard");
    }
    next();
}



router.post("/admin", redirectIfLoggedIn,  async (req, res) => {
  const { adminEmail, adminPassword } = req.body;

  try {
    const email = await db.query(
      "SELECT * FROM adminCredentials WHERE email_address = $1", 
      [adminEmail]
    );

    if (email.rows.length < 1) {
      
      
      
      return res.render("admin/form/login.ejs", {
        message: "Incorrect Credentials",
    
      });
    } 
    
    const adminUser = email.rows[0];
    const checkPassword = await bcrypt.compare(adminPassword, adminUser.password);

    if (!checkPassword) {
      
      
      
      return res.render("admin/form/login.ejs", {
        message: "Incorrect Credentials",
         
      });
    } 
    
    
       req.session.admin = { id: adminUser.id, email: adminUser.email_address };
        
        
        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.render("admin/form/login.ejs", { message: "Session error." });
            }
            res.redirect("/admin/dashboard");
        });

  } catch(error) {
    console.error("Admin login error:", error);
    
    
    const newToken = crypto.randomBytes(32).toString('hex');
    req.session.csrfToken = newToken;
    
    res.render("admin/form/login.ejs", {
      message: "Server error. Please try again.",
      csrfToken: newToken
    });
  }
});

export default router;