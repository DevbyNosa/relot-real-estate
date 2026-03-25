import express from 'express';
import Router from "../../Middlewares/auth.js";
import  { checkBanStatus } from '../../Middlewares/auth.js';
import db from '../../config/settings.js'

const router = express.Router();


router.get("/dashboard", checkBanStatus, async (req, res) => {
    if (req.session.user) {
        try {
          
            const viewPost = await db.query(`
                SELECT * FROM agentPost 
                WHERE is_approved = true 
                ORDER BY created_at DESC 
                LIMIT 10
            `);
            
            
            const countResult = await db.query(`
                SELECT COUNT(*) FROM agentPost WHERE is_approved = true
            `);
            const totalItems = parseInt(countResult.rows[0].count);
            
            res.render("client/dashboard/home.ejs", { 
                user: req.session.user, 
                listings: viewPost.rows,
                totalItems: totalItems,
                hasMore: viewPost.rows.length < totalItems,
                searchTerm: ''
            });
            
        } catch (err) {
            console.error(err);
            res.status(500).send("Database Error");
        }
    } else {
        res.redirect("/login");
    }
});


router.get("/api/listings", checkBanStatus, async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        
        const listings = await db.query(`
            SELECT * FROM agentPost 
            WHERE is_approved = true 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        
        
        const countResult = await db.query(`
            SELECT COUNT(*) FROM agentPost WHERE is_approved = true
        `);
        const totalItems = parseInt(countResult.rows[0].count);
        
        res.json({
            listings: listings.rows,
            hasMore: (offset + listings.rows.length) < totalItems,
            nextPage: page + 1
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Route to get single house details
router.get("/house-details/:id", checkBanStatus, async (req, res) => {
    if(!req.session.user) {
    return  res.redirect("/login");
    }
    try {
        const { id } = req.params;
        
        const house = await db.query(`
            SELECT agentPost.*, agentdetails.username, agentdetails.phone 
            FROM agentPost 
            JOIN agentdetails ON agentPost.agent_id = agentdetails.id
            WHERE agentPost.id = $1 AND agentPost.is_approved = true
        `, [id]);
        
        if (house.rows.length === 0) {
            return res.status(404).send("House not found");
        }
        
        const listing = house.rows[0];
        
        
        let images = [];
        try {
            images = JSON.parse(listing.property_images || '[]');
        } catch(e) {
            images = [];
        }
        
        res.render("client/dashboard/houseDetails.ejs", {
            user: req.session.user || null,
            listing: listing,
            images: images,
            agent: req.session.agent || null
        });
        
    } catch(err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.get("/search", checkBanStatus, async (req, res) => {
    const searchTerm = req.query.q || ''; 
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    if (!searchTerm.trim()) {
        return res.redirect("/dashboard");
    }
    
    const query = `%${searchTerm}%`;
      
    try {
        const searchHouses = await db.query(`
            SELECT * FROM agentPost 
            WHERE is_approved = true 
            AND (
                title ILIKE $1 
                OR houseType ILIKE $1 
                OR address ILIKE $1 
                OR state ILIKE $1 
                OR city ILIKE $1
            )
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [query, limit, offset]);

        const countResult = await db.query(`
            SELECT COUNT(*) FROM agentPost 
            WHERE is_approved = true 
            AND (
                title ILIKE $1 
                OR houseType ILIKE $1 
                OR address ILIKE $1 
                OR state ILIKE $1 
                OR city ILIKE $1
            )
        `, [query]);
        
        const totalResults = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalResults / limit);

        res.render("client/dashboard/search-houses.ejs", {
            searchResults: searchHouses.rows,
            searchTerm: searchTerm,
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalResults,
            user: req.session.user
        });
        
    } catch(err) {
        console.error(err);
        res.status(500).send("Search failed");
    }
});


export default router;