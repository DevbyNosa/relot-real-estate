import express from 'express';
import Router from 'express';
import db from '../../config/settings.js'

const router = Router();


router.get("/agents", async (req, res) => {
  if(req.session.admin) {
  
    try {
      const viewAgents = await db.query(`
         SELECT * FROM agentdetails 
  JOIN signup ON agentdetails.id = signup.id
        `)

        res.render("admin/agents.ejs", {
          agents: viewAgents.rows
        });
    } catch(err) {
      console.log(err)
    }
    
  } else {
    res.redirect("/admin")
  }
})

router.get("/agent/:id", async (req, res) => {
  try {
  if(req.session.admin) {
    const {id} = req.params
      const result = await db.query(`
    SELECT * 
    FROM agentdetails 
    JOIN signup ON agentdetails.id = signup.id 
    WHERE agentdetails.id = $1
`, [id]);
        const agent = result.rows[0];

        res.render("admin/edit-agent.ejs", { agent: agent });
  } else {
     res.redirect("/admin");
  }
} catch(err) {
  if (err.code === '23505') { 
      console.log(err);
     res.status(500).send("An error occurred while updating.");
}
}
})

router.post("/agents/:id", async (req, res) => {
  try {

  
  if(req.session.admin) {
    const agentId = req.params.id;
    const{agent_username,agent_phone} = req.body

    const upDateAgent = await db.query(`UPDATE agentdetails SET username = $1, phone = $2 WHERE id = $3`, [agent_username, agent_phone, agentId]);

    res.redirect("/admin/agents?success=updated"); 
  } else {
    res.redirect("/admin");
  }
} catch(err) {
  if (err.code === '23505') { 
      return res.send("Error: That username is already taken. Please choose another.");
            }
      console.log(err);
     res.status(500).send("An error occurred while updating.");
}
})

export default router;