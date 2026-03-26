import express from 'express';
import db from '../../config/settings.js';
import { checkBanStatus } from '../../Middlewares/auth.js';

export const requireAgent = (req, res, next) => {
    if (!req.session.agent) {
        return res.redirect("/become-an-agent");
    }
    next();
};

export const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
};

const router = express.Router();

router.get("/become-an-agent", requireLogin, checkBanStatus, async (req, res) => {
    console.log("📝 GET /become-an-agent - User ID:", req.session.user.id);
    
    try {
        const agentCheck = await db.query(
            "SELECT * FROM agentdetails WHERE id = $1",
            [req.session.user.id]
        );

        if (agentCheck.rows.length > 0) {
            console.log("✅ User already has agent profile, auto-login as agent");
            
            req.session.agent = {
                id: agentCheck.rows[0].id,
                username: agentCheck.rows[0].username,
                phone: agentCheck.rows[0].phone
            };
            
            return res.redirect("/agent/listings");
        }

        res.render("agent/home.ejs", { 
            user: req.session.user, 
            message: "" 
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).send("Server error");
    }
});

router.post("/become-an-agent", requireLogin, checkBanStatus, async (req, res) => {
    console.log("📝 POST /become-an-agent - User ID:", req.session.user.id);
    console.log("Request body:", req.body);
    
    const { username, phone } = req.body;
    const userId = req.session.user.id;
    
    if (!username || !phone) {
        return res.render("agent/home.ejs", { 
            user: req.session.user, 
            message: "Username and phone are required" 
        });
    }
     
    try {
        const existingAgent = await db.query(
            "SELECT * FROM agentdetails WHERE id = $1",
            [userId]
        );
        
        if (existingAgent.rows.length > 0) {
            req.session.agent = {
                id: existingAgent.rows[0].id,
                username: existingAgent.rows[0].username,
                phone: existingAgent.rows[0].phone
            };
            return res.redirect("/agent/listings");
        }
        
        const agentResult = await db.query(
            `INSERT INTO agentdetails (id, username, status, phone) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [userId, username, true, phone]
        );
        
        req.session.agent = {
            id: agentResult.rows[0].id,
            username: agentResult.rows[0].username,
            phone: agentResult.rows[0].phone
        };
        
        return res.redirect("/agent/listings");
        
    } catch (err) {
        console.error("❌ Error:", err);
        
        if (err.code === '23505') {
            let errorMsg = "That username is already taken"; 
            
            if (err.detail && err.detail.includes("phone")) {
                errorMsg = "That phone number is already registered";
            }

            return res.render("agent/home.ejs", { 
                user: req.session.user, 
                message: errorMsg 
            });
        }
        
        return res.render("agent/home.ejs", { 
            user: req.session.user, 
            message: "An error occurred. Please try again." 
        });
    } 
});

export default router;