import express from 'express';
import Router from 'express';
import db from '../../config/settings.js';

const router = Router();

router.get("/listings", async(req, res) => {
  try {
  if(!req.session.admin) {

    return res.redirect("/admin")


  } 

   const agentDetail = req.session.agent;
   const response = await db.query(`
       SELECT agentPost.*, agentdetails.username, agentdetails.phone 
      FROM agentPost 
      JOIN agentdetails ON agentPost.agent_id = agentdetails.id
      ORDER BY agentPost.created_at DESC
    `);

   res.render("admin/approveListing.ejs", {
   agentPost: response.rows,
   agentDetail,
   })
} catch (err) {
   console.log(err);
}
})




router.post("/listings/:id", async (req, res) => {
  const { id } = req.params;

  try {

  

  await db.query("UPDATE agentPost SET is_approved = true WHERE id = $1", [id]);

   res.redirect("/admin/listings");

  } catch(err) {
    console.log(err);
      res.redirect("/admin/listings");
  }
})

router.post("/listings/delete/:id", async (req, res) => {
  const {id} = req.params;

  try {
     
   const checkPost = await db.query("SELECT * FROM agentPost WHERE id = $1", [id]);
    
    if (checkPost.rows.length === 0) {
      console.log("❌ No post found with ID:", id);
      return res.redirect("/admin/listings?error=Post not found");
    }


    console.log("✅ Found post to delete:", checkPost.rows[0]);

    // Delete the post
    const response = await db.query("DELETE FROM agentPost WHERE id = $1", [id]);
    
    console.log(`✅ Deleted ${response.rowCount} row(s)`);

    res.redirect("/admin/listings?success=Post deleted successfully");
  } catch(err) {
    console.log(err);
     res.redirect("/admin/listings");
  }
})

export default router;