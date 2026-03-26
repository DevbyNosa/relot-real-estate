import express from 'express';
import db from '../../config/settings.js'
import Router from 'express'
import { requireLogin } from '../agent/agent-route.js';
import { checkBanStatus } from '../../Middlewares/auth.js';
import bcrypt from 'bcrypt';


const router = Router();



router.get("/account-settings", checkBanStatus, requireLogin, async (req, res) => {
        res.render("client/settings/settings.ejs");
})

router.get("/account-informations", checkBanStatus, requireLogin, async (req, res) => {
        res.render("client/settings/account-info.ejs")
})

router.get("/settings-about", checkBanStatus, requireLogin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT *
            FROM signup
            LEFT JOIN agentdetails ON signup.id = agentdetails.id
            WHERE signup.id = $1
        `, [req.session.user.id]);

        const user = result.rows[0] || {}; // safe fallback

        res.render("client/settings/about-settings.ejs", {
            fullName: user.fullName || "",
            email: user.email_address || "",
            date: user.date || "",
            username: user.username || "",
            phone_number: user.phone || "",
        });

    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).send("Server Error");
    }
});

router.get("/edit-profile", checkBanStatus, requireLogin, async (req, res) => {
       const user = await db.query("SELECT fullname, email_address FROM signup WHERE id = $1", [req.session.user.id]);
        res.render("client/settings/editProfile.ejs", {
            messages: req.query.success || req.query.failure || "", 
            newName: user.rows[0].fullname, 
            newEmail: user.rows[0].email_address 
        });
})

router.post("/edit-profile", checkBanStatus, requireLogin, async (req, res) => {
        const userId = req.session.user.id
        const {newName, newEmail} = req.body;

        try {

                if (!newName && !newEmail) { 
    return res.render("client/settings/editProfile.ejs", { 
        messages: "Please fill in at least one field" 
    });
}
          const updateProfile = db.query(`
                UPDATE signup
                SET fullname = $1, email_address = $2 WHERE id = $3
                `, [newName, newEmail, userId]);

                res.redirect("/edit-profile?success=profile updated successfully")
        } catch(err) {
            console.log(err);
              res.redirect("/edit-profile?failure=profile failed to update")
        }
})


router.get("/change-password", checkBanStatus, requireLogin, async (req, res) => {
        res.render("client/settings/change-password.ejs", {
                messages: "",
                success: ""
        });
})

router.post("/change-password", checkBanStatus, requireLogin, async (req, res) => {
        const {currentPassword, newPassword, confirmPassword} = req.body;

        const userId = req.session.user.id;
        try {
        

        const checkPasword = await  db.query("SELECT * FROM signup WHERE id = $1", [userId]);

        const userPassword = checkPasword.rows[0].password;

        const comparePassword = await bcrypt.compare(currentPassword, userPassword);

     if (!comparePassword) {
            return res.render("client/settings/change-password.ejs", { messages: "Incorrect Password" });
        }
           

        if(newPassword !== confirmPassword) {
         return   res.render("client/settings/change-password.ejs", {
                messages: "This password does not match",
            })
        }

         const reviewBothPassword = await bcrypt.compare(newPassword, userPassword);

            if(reviewBothPassword) {
                return res.render("client/settings/change-password.ejs", {
                 messages: "Cannot enter old password"
                })
            }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

        const updatePassword = await db.query("UPDATE signup SET password = $1 WHERE id = $2",[hashedPassword, userId]);

        if(updatePassword) {
            return    res.render("client/settings/change-password.ejs", {
                        success: "Password successfully updated",
                        messages: ""
                })
        }
            
        
        } catch(err) {
                console.log(err)
                res.status(500).send("Server Error in changing password")
        }
})

router.get("/delete-account", checkBanStatus,requireLogin, async (req, res) => {

                
          res.render("client/settings/delete-account.ejs");
})
/// DELETING USERS ACCOUNT
router.post("/delete-account", checkBanStatus, requireLogin, async (req, res) => {
     const userId = req.session.user.id;

     try {
       
        await db.query(`DELETE FROM agentPost WHERE agent_id = $1`, [userId]);
        await db.query(`DELETE FROM agentdetails WHERE id = $1`, [userId])
        await db.query(`DELETE FROM signup WHERE id = $1`, [userId]);
       res.redirect("/?delete_account=success")
     } catch (err) {
        console.error(err)
     }
})

router.get("/help-center", checkBanStatus, requireLogin, async (req, res) => {
        res.render("client/settings/help-center.ejs")
})



export default router