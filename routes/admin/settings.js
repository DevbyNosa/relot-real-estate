import express from 'express';
import db from '../../config/settings.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const saltRounds = 12;


router.get("/me", async (req, res) => {
    if (!req.session.admin) return res.redirect("/admin");

    try {
        const adminDetails = await db.query(`SELECT * FROM admincredentials LIMIT 1`);
        res.render("admin/settings/admin-settings.ejs", { 
            admin: adminDetails.rows[0], 
            success: "", 
            error: "" 
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});


router.post("/update-email", async (req, res) => {
    if (!req.session.admin) return res.redirect("/admin");
    const { email } = req.body;

    try {
        const adminDetails = await db.query(`SELECT * FROM admincredentials WHERE id = 1`);
        const admin = adminDetails.rows[0];

      
        if (email === admin.email_address) {
            return res.render("admin/settings/admin-settings.ejs", { 
                admin, 
                error: "Email already exists", 
                success: "" 
            });
        }

        await db.query("UPDATE admincredentials SET email_address = $1 WHERE id = 1", [email]);
        
   
        const updatedAdmin = await db.query(`SELECT * FROM admincredentials WHERE id = 1`);
        
        res.render("admin/settings/admin-settings.ejs", { 
            admin: updatedAdmin.rows[0], 
            success: "Success update email", 
            error: "" 
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Database Error");
    }
});


router.post("/update-password", async (req, res) => {
    if (!req.session.admin) return res.redirect("/admin");
    const { oldPassword, newPassword, confirmPassword } = req.body;

    try {
        const adminTable = await db.query(`SELECT * FROM admincredentials LIMIT 1`);
        const admin = adminTable.rows[0];

        if (newPassword !== confirmPassword) {
            return res.render("admin/settings/admin-settings.ejs", { 
                admin, 
                error: "Passwords do not match", 
                success: "" 
            });
        }

       
        const comparePassword = await bcrypt.compare(oldPassword, admin.password);
        
        if (comparePassword) {
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
            await db.query(`UPDATE admincredentials SET password = $1 WHERE id = 1`, [hashedNewPassword]);
            
            res.render("admin/settings/admin-settings.ejs", { 
                admin, 
                success: "Updated Password Successfully", 
                error: "" 
            });
        } else {
            res.render("admin/settings/admin-settings.ejs", { 
                admin, 
                error: "Incorrect current password", 
                success: "" 
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});

export default router;
