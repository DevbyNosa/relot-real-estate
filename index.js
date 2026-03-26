import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import session from 'express-session'; 
import nodemailer from 'nodemailer'
import dashboardRoute from './routes/client/dashboard.js';
import userSettings from './routes/client/settings.js'
import authRoute from './Middlewares/auth.js'; 
import agentRoute from './routes/agent/agent-route.js'
import agentListing from './routes/agent/agent-listing.js'
import adminLoginRoute from './Middlewares/adminAuth.js';
import adminDashboard from './routes/admin/dashboard.js'
import adminUsers from './routes/admin/users.js'
import adminAgent from './routes/admin/agent.js'
import adminProperties from './routes/admin/properties.js';
import adminListing from './routes/admin/approveListing.js';
import methodOverride from 'method-override';
import maintenance from './routes/admin/maintenance.js'
import db from './config/settings.js'; 
import adminSettings from './routes/admin/settings.js';
import frontendHome from './routes/admin/frontend.js';



const app = express();
const port = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views', './views'); 

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(methodOverride('_method'));




app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 * 14, 
    httpOnly: true,
    secure: false, 
    sameSite: 'lax' 
  } 
}));


app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

export const checkMaintenance = async (req, res, next) => {
   
    if (req.path.startsWith('/admin') || req.path === '/maintenance') {
        return next();
    }

    try {
        const result = await db.query("SELECT is_maintenance, maintenance_reason FROM site_settings WHERE id = 1");
        const settings = result.rows[0];

        if (settings?.is_maintenance) {
           
            return res.render("client/settings/maintenance.ejs", { 
                reason: settings.maintenance_reason 
            });
        }
        next();
    } catch (err) {
        next(); 
    }
};

app.use(checkMaintenance);

app.get("/", async (req, res) => {
  try {
   const agentHouses = await db.query(`
    SELECT *
FROM agentpost LIMIT 6
`)

const frontends = await db.query(`SELECT * FROM frontend_index`)
  res.render("index.ejs", { 
    listings: agentHouses.rows,
    user: req.session.user || null,
    frontend: frontends.rows[0] || {},
    success: ""
  });
} catch (err) {
  res.status(500).send("Server Error request")
}
});


app.post('/contact', async (req, res) => {
    const { contact_name, contact_email, contact_message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.CONTACT_PASSWORD
        }
    });

    const mailOptions = {
        from: contact_email,
        to: process.env.EMAIL,
        subject: `New Message from ${contact_name} Contact Relot`,
        text: `Name: ${contact_name}\nEmail: ${contact_email}\n\nMessage: ${contact_message}`,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #26de81;">
                <h2 style="color: #061f18;">New Relot Message</h2>
                <p><strong>From:</strong> ${contact_name} (${contact_email})</p>
                <p style="background: #f4f4f4; padding: 15px;">${contact_message}</p>
               </div>`
    };

    try {
        await transporter.sendMail(mailOptions);

        const agentHouses = await db.query(`SELECT * FROM agentpost LIMIT 4`);
        const frontends = await db.query(`SELECT * FROM frontend_index`);

        res.render("index.ejs", {
            listings: agentHouses.rows,
            user: req.session.user || null,
            frontend: frontends.rows[0],
            success: "Message Sent"
        });
    } catch (error) {
        console.log(error);

        const agentHouses = await db.query(`SELECT * FROM agentpost LIMIT 4`);
        const frontends = await db.query(`SELECT * FROM frontend_index`);

        res.status(500).render("index.ejs", {
            listings: agentHouses.rows,
            user: req.session.user || null,
            frontend: frontends.rows[0],
            success: "",
            message: "Failed to send"
        });
    }
});




app.use("/", authRoute);



app.use("/", dashboardRoute); 
app.use("/", agentRoute);

app.use("/", adminLoginRoute);
app.use("/", adminDashboard);
app.use("/admin", adminUsers);
app.use("/admin",adminAgent);
app.use("/admin", adminProperties);
app.use("/admin", adminListing);
app.use("/", agentListing);
app.use("/", userSettings);
app.use("/admin", maintenance);
app.use("/admin", adminSettings)
app.use("/admin",frontendHome)



app.use((req, res) => {
    res.status(404).render('404.ejs', { 
        title: "Page Not Found",
        url: req.originalUrl 
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack); 
    
    res.status(500).render('500.ejs', {
        title: "Server Error",
        message: "It's not you, it's us.",
        url: req.originalUrl
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});