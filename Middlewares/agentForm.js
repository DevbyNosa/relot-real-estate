import express from 'express';
import Router from 'express';

const router = Router();


router.post("/become-an-agent", async (req, res) => {
  const {username, phone, profile_img} = req.body;

  try {
  const checkValidation = db.query("SELECT * FROM agentdetails WHERE username = $1")
  } catch(err) {
     console.log(err)
  }
})
export default router;