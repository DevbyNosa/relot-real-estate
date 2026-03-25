import express from 'express';
import db from '../../config/settings.js';
import { checkBanStatus } from '../../Middlewares/auth.js';
import multer from 'multer';


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



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({
    storage
})





const router = express.Router();

router.post("/agent/profile", requireLogin, requireAgent, checkBanStatus, upload.single("profile_img"), async (req, res) => {
    try {
        
        if (!req.file) {
            return res.redirect("/agent/profile?error=No file uploaded");
        }

        const imagePath = `/uploads/${req.file.filename}`;  

        await db.query(
            "UPDATE agentdetails SET profile_img = $1 WHERE id = $2",
            [imagePath, req.session.agent.id]
        );

        req.session.agent.profile_img = imagePath;

        res.redirect("/agent/profile?message=Profile image updated successfully");
    } catch(err) {
        
        res.redirect("/agent/profile?error=Failed to update image");
    }
});


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
                phone: agentCheck.rows[0].phone,
                profile_img: agentCheck.rows[0].profile_img  
            };
            
            return res.redirect("/agent/listings");
        }

       
        res.render("agent/home.ejs", { 
            user: req.session.user, 
            message: "" 
        });

    } catch (err) {
        
        res.status(500).send("Server error");
    }
});

router.post("/become-an-agent", requireLogin, checkBanStatus, upload.single("profile_img"), async (req, res) => {
    console.log("📝 POST /become-an-agent - User ID:", req.session.user.id);
    console.log("Request body:", req.body);
    
    const { username, phone, profile_img } = req.body;
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
                phone: existingAgent.rows[0].phone,
                profile_img: existingAgent.rows[0].profile_img  
            };
            return res.redirect("/agent/listings");
        }

        const imagePath = req.file ? `/uploads/properties/${req.file.filename}` : null;
        
        const agentResult = await db.query(
            `INSERT INTO agentdetails (id, username, status, phone, profile_img ) 
             VALUES ($1, $2, 'active', $3, $4) 
             RETURNING *`,
            [userId, username, phone, imagePath]
        );

        
        
       
        req.session.agent = {
            id: agentResult.rows[0].id,
            username: agentResult.rows[0].username,
            phone: agentResult.rows[0].phone,
            profile_img: agentResult.rows[0].profile_img  
        };
        
        return res.redirect("/agent/listings");
        
    } catch (err) {
        
        
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
    } 
});




export default router;