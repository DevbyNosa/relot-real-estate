import express from 'express';
import Router from 'express';
import db from '../../config/settings.js'

const router = Router();

router.get("/properties", async (req, res) => {
  if(req.session.admin) {
    const showProperties = await db.query("SELECT * FROM agentPost")
    res.render("admin/properties.ejs", {
      properties: showProperties.rows,
    });
  } else {
    res.redirect("/admin");
  }
  
});


export default router;