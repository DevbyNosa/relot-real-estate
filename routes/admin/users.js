import express from 'express';
import Router from 'express';
import bodyParser  from 'body-parser';
import db from '../../config/settings.js'

const router = express();

router.get("/users", async (req, res) => {
  if(req.session.admin) {
    const usersDetails = await db.query(`
      SELECT * FROM signup
      `);


  res.render("admin/users", {
    users: usersDetails.rows
  });
  } else {
    res.redirect("/admin")
  }
})

router.get("/users/:id", async (req, res) => {
  if(req.session.admin) {
    const {id} = req.params;
    const selectUsers = await db.query(`
      SELECT * FROM signup WHERE id = $1
      `, [id])
      const usersDetails = selectUsers.rows[0]
   res.render("admin/edit-user.ejs", {
    users: usersDetails
   })
  } else {
    res.redirect("/admin")
  }
})

router.post("/users/:id", async (req, res) => {
  try {

  
  if(req.session.admin) {
    const userId = req.params.id;
    const {name, email, status} = req.body;

    const updateUser = await db.query(`UPDATE signup SET fullname = $1, email_address = $2, status = $3 WHERE id = $4`, [name, email, status, userId])

    res.redirect("/admin/users?success=updated");
  } else {
    res.redirect("/admin")
  }
} catch(err) {
  console.log(err);
  res.status(500).send("Error updating user");
}
})

router.post("/ban-user/:id", async (req, res) => {
  if(req.session.admin) {

  
  const {id} = req.params;

  try {
    const banUser = await db.query("UPDATE signup SET status = NOT status WHERE id = $1", [id]);

     res.redirect("/admin/users?success=banned");
  } catch(err) {
    console.log(err);
    res.status(500).send("Error updating user");
  }
} else {
  res.redirect("/admin")
}
})

export default router;