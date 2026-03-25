import express from "express";
import Router from 'express';
import db from '../../config/settings.js';


const router = Router();



router.get("/maintenance", async (req, res) => {
  if(!req.session.admin) {
    return res.redirect("/admin")
  }

     try {
        const result = await db.query("SELECT * FROM site_settings WHERE id = 1");
        const settings = result.rows[0]; 
        res.render("admin/maintenance.ejs", { settings }); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading settings");
    }

  
})

router.post("/maintenance", async (req, res) => {
    
    if (!req.session.admin) { 
        return res.redirect("/admin"); 
    }

    try {
        const { maintenace_text, is_maintenance } = req.body;
        
       
        const status = (is_maintenance === "on");

        
        await db.query(
            "UPDATE site_settings SET is_maintenance = $1, maintenance_reason = $2 WHERE id = 1",
            [status, maintenace_text]
        );

       
        res.redirect("/admin/maintenance?success=true");

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).send("Database Update Failed");
    }
});


export default router;