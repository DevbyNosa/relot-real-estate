import express from 'express';
import Router from 'express';
import bodyParser  from 'body-parser';
import db from '../../config/settings.js';

const router = Router();


router.get("/admin/dashboard", async (req, res) => {
  if(req.session.admin) {


    const result = await db.query(`
      SELECT * FROM signup

      `)

      const agents = await db.query("SELECT * FROM agentdetails");

      const approvedProperties = await db.query("SELECT * FROM agentPost WHERE is_approved = true");

      const falseProperties = await db.query("SELECT * FROM agentPost WHERE is_approved = false");

      const last3Users = await db.query(`
        SELECT * FROM signup 
        ORDER BY id DESC 
        LIMIT 3
      `);
      const last3Properties = await db.query(`
        SELECT * FROM agentPost ORDER BY id DESC LIMIT 3
      `)

       const usersCount = result.rows.length;
       const agentCount = agents.rows.length;
       const checkedProperties = approvedProperties.rows.length;
       const pendingCount = falseProperties.rows.length;
       
  res.render("admin/dashboard/home.ejs", {
    usersLength: usersCount,
    admin: req.session.admin,
    last3Users: last3Users.rows,
    agentLength: agentCount,
    checkedProperties,
    pendingCount,
    last3Houses: last3Properties.rows
  })
  } else {
    res.redirect("/admin")
  }
})

export default router;