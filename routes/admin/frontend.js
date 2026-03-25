import { Router } from 'express';
import db from '../../config/settings.js';

const router = Router();

// --- REUSABLE HELPER FUNCTIONS ---

/**
 * Renders a view with common hero data and a success message.
 * We use 'data.hero' to avoid ReferenceErrors.
 */
function successMsg(res, view, data) {
    return res.render(view, {
        hero: data.hero || {},
        success: "Updated Successfully"
    });
}

/**
 * Middleware to check admin session 
 **/
const isAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect("/admin");
    }
    next();
};

// --- GET ROUTES --- //

router.get("/frontend/:page", isAdmin, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM frontend_index LIMIT 1");
        const page = req.params.page; // home, about, features, etc.
        
   
        res.render(`admin/frontend_${page}.ejs`, {
            hero: result.rows[0] || {},
            success: "",
           
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

// --- POST ROUTES ---

router.post("/frontend/home", isAdmin, async (req, res) => {
    const { frontend_title, frontend_description, first_button, second_button } = req.body;
    try {
        const result = await db.query(
            "UPDATE frontend_index SET hero_title = $1, hero_text = $2, first_button = $3, second_button = $4 RETURNING *",
            [frontend_title, frontend_description, first_button, second_button]
        );
        
        successMsg(res, "admin/frontend_home.ejs", { hero: result.rows[0],   });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

router.post("/frontend/about", isAdmin, async (req, res) => {
    const { about_title, about_p1, about_p2, about_image } = req.body;
    try {
        const result = await db.query(
            "UPDATE frontend_index SET about_title =$1, about_first_txt = $2, about_second_txt = $3, about_img = $4 RETURNING *",
            [about_title, about_p1, about_p2, about_image]
        );
        successMsg(res, "admin/frontend_about.ejs", { hero: result.rows[0], });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

router.post("/frontend/features", isAdmin, async (req, res) => {
    const { main_title, card1_h3, card1_text, card2_h3, card2_text, card3_h3, card3_text } = req.body;
    try {
        const result = await db.query(
            `UPDATE frontend_index SET features_title = $1, card1_h3 = $2, card1_txt = $3, card2_h3 = $4, card2_txt = $5, card3_h3 = $6, card3_txt = $7 RETURNING *`,
            [main_title, card1_h3, card1_text, card2_h3, card2_text, card3_h3, card3_text]
        );
        successMsg(res, "admin/frontend_features.ejs", { hero: result.rows[0],   });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

router.post("/frontend/testimonials", isAdmin, async (req, res) => {
    const { header_span, header_h5, card1_text, card1_span1, card1_span2, card2_text, card2_span1, card2_span2, card3_text, card3_span1, card3_span2 } = req.body;
    try {
        const result = await db.query(
            `UPDATE frontend_index SET 
            testimonials_title = $1, testimonial_main_title = $2,
            testimonial_one = $3, testimonial1_span1 = $4, testimonial1_span2 = $5,
            testimonial_two = $6, testimonial2_span1 = $7, testimonial2_span2 = $8,
            testimonial_three = $9, testimonial3_span1 = $10, testimonial3_span2 = $11
            RETURNING *`,
            [header_span, header_h5, card1_text, card1_span1, card1_span2, card2_text, card2_span1, card2_span2, card3_text, card3_span1, card3_span2]
        );
        successMsg(res, "admin/frontend_testimonials.ejs", { hero: result.rows[0],
            
         });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

export default router;
