import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../../config/settings.js';
import { checkBanStatus } from '../../Middlewares/auth.js'; 
import { requireLogin, requireAgent } from './agent-route.js';

const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
       
        const uploadPath = path.join(__dirname, '../../public/uploads/properties');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const agentId = req.session.agent.id;
        cb(null, `property-${agentId}-${uniqueSuffix}${ext}`);
    }
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};


const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: fileFilter
});


router.get("/agent/listings", requireLogin, checkBanStatus, requireAgent, async (req, res) => {

    const agentId = req.session.agent.id

      const agents = await db.query("SELECT * FROM agentdetails WHERE id = $1", [agentId])
  
    res.render("agent/agentListing.ejs", {
        messages: "",
        post: "",
        user: req.session.user,
        agent: req.session.agent,
        agentdetails: agents.rows
    });
});


router.get("/agent/view/listings", requireLogin, checkBanStatus, requireAgent, async (req, res) => {
    try {
        const agentId = req.session.agent.id;

  const agents = await db.query("SELECT * FROM agentdetails WHERE id = $1", [agentId]);

       const listings = await db.query(`
            SELECT * FROM agentPost 
            WHERE agent_id = $1 
            ORDER BY created_at DESC
        `, [agentId]);
      
        
        
        res.render("agent/agentViewListing.ejs", {
            user: req.session.user,
            agent: req.session.agent,
            listings: listings.rows,
            messages: req.query.message || "",
            agentdetails: agents.rows[0] || req.session.agent
        });
    } catch(err) {
        console.error(err);
        res.redirect("/agent/listings?error=Could not load listings");
    }
});

router.get("/agent/view/listings/:id", requireLogin, checkBanStatus, requireAgent, async (req, res) => {
    try {
        const agentId = req.session.agent.id;
       
       const listings = await db.query(`
            SELECT * FROM agentPost 
            WHERE agent_id = $1 
            ORDER BY created_at DESC
        `, [agentId]);
        
        res.render("agent/agentViewEditListing.ejs", {
           
            agent: req.session.agent,
            listing: listings.rows[0],
            
        });
    } catch(err) {
        console.error(err);
        res.redirect("/agent/listings?error=Could not load edit listings");
    }
});


router.post("/agent/view/listings/:id", requireLogin, checkBanStatus, requireAgent, async (req, res) => {
  try {
  const { id } = req.params;
  const agentId = req.session.agent.id;

    const {editTitle, editNumber, editType, editAddress, editState, editCity, editFeatures, editStatus} = req.body

        const updateListings = await db.query(`
          UPDATE agentPost SET title = $1, amount = $2, houseType = $3, address = $4, state = $5, city = $6, features = $7, house_status = $8 WHERE id = $9 AND agent_id = $10
          `, [editTitle, editNumber, editType, editAddress, editState, editCity,editFeatures, editStatus, id, agentId ])

          res.redirect(`/agent/view/listings/${id}?message=Updated`);
  } catch(err) {
    console.log(err);
    res.status(500).send("Server Error: Could not update listing");
  }
})

router.get("/agent/view/listings/del/:id", requireLogin, checkBanStatus, requireAgent, async (req, res) => {
    const { id } = req.params;
    const agentId = req.session.agent.id;

    try {
      
        const listing = await db.query(`
            SELECT * FROM agentPost WHERE id = $1 AND agent_id = $2
        `, [id, agentId]);

        const agents = await db.query("SELECT * FROM agentdetails WHERE id = $1", [agentId]);

        if (listing.rows.length === 0) {
            return res.redirect("/agent/view/listings?error=Listing not found");
        }

      
        res.render("agent/agentDeleteConfirm.ejs", {
            listing: listing.rows[0],
            user: req.session.user,
            agent: req.session.agent,
            agentdetails: agents.rows
        });

    } catch(err) {
        console.error(err);
        res.redirect("/agent/view/listings?error=Could not load page");
    }
});

router.post("/agent/view/listings/del/:id", requireLogin, checkBanStatus, requireAgent, async (req, res) => {
    const { id } = req.params;
    const agentId = req.session.agent.id;

    try {
        
        
        const checkListing = await db.query(`
            SELECT * FROM agentPost WHERE id = $1 AND agent_id = $2
        `, [id, agentId]);

        if (checkListing.rows.length === 0) {
           
            return res.redirect("/agent/view/listings?error=Listing not found");
        }

        console.log("✅ Listing found, deleting...");

     
        const deletePost = await db.query(`
            DELETE FROM agentPost WHERE id = $1
        `, [id]);  

        

       
        res.redirect("/agent/view/listings?message=Listing deleted successfully");
        
    } catch(err) {
       
        res.redirect("/agent/view/listings?error=Failed to delete");
    }
});
router.post("/agent/listings", 
    requireLogin, 
    checkBanStatus, 
    requireAgent, 
    upload.array('property_images', 5), 
    async(req, res) => {
        
        console.log("Agent ID:", req.session.agent.id);
        console.log("Files received:", req.files?.length || 0);
        console.log("Form data:", req.body);
        
        const agentId = req.session.agent.id;
        const { title, amount, houseType, address, state, city, features, houseStatus, whatsapp } = req.body;

        try {
           
            let imagePaths = [];
            if (req.files && req.files.length > 0) {
                imagePaths = req.files.map(file => `/uploads/properties/${file.filename}`);
            }

           
            const imagesJson = JSON.stringify(imagePaths);

          
            await db.query(`
                INSERT INTO agentPost(
                    agent_id, title, amount, houseType, address, 
                    state, city, features, property_images, house_status, whatsapp, created_at
                ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            `, [agentId, title, amount, houseType, address, state, city, features, imagesJson, houseStatus || 'available', whatsapp]);

            res.redirect("/agent/view/listings?message=Listing submitted successfully!");
            
        } catch(err) {
            console.error(err);
            res.redirect("/agent/listings?error=Failed to create listing");
        }
    }
);

export default router;