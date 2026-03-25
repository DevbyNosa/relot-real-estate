CREATE TABLE signup (
  id SERIAL PRIMARY KEY,
  fullName VARCHAR(255),
  email_address VARCHAR(255),
  password VARCHAR(255),
  date TIMESTAMP DEFAULT NOW(),
  status BOOLEAN
);

CREATE TABLE agentDetails (
   id INT PRIMARY KEY REFERENCES signup(id),
  username VARCHAR(255) NOT NULL,
  status BOOLEAN,
  properties INT
);

ALTER TABLE agentdetails 
ADD COLUMN phone VARCHAR(20),
ADD COLUMN profile_img TEXT;



--| Admin Table |--

CREATE TABLE adminCredentials (
  id SERIAL PRIMARY KEY,
  email_address VARCHAR(255),
  password VARCHAR(255),
  status BOOLEAN DEFAULT TRUE
);

CREATE TABLE agentPost (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES agentDetails(id),
  title VARCHAR(255),
  amount INT,
  houseType VARCHAR(30),
  address VARCHAR(255),
  state VARCHAR(30),
  city VARCHAR(255),
  features TEXT,
  property_images TEXT DEFAULT '[]',
  house_status VARCHAR(30) DEFAULT 'available',
  whatsapp VARCHAR(20),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE site_settings (
    
    id INTEGER PRIMARY KEY CHECK (id = 1) DEFAULT 1,
    is_maintenance BOOLEAN DEFAULT false,
    maintenance_reason TEXT DEFAULT 'We are currently performing scheduled updates.'
);


CREATE TABLE frontend_index (
  id INT REFERENCES adminCredentials(id),
  hero_title VARCHAR(75),
  hero_text VARCHAR(255),
  first_button VARCHAR(50),
  second_button VARCHAR(50),

  -- about section
  about_title VARCHAR(50),
  about_first_txt VARCHAR(255),
  about_second_txt VARCHAR(255),
  about_img TEXT,

  -- features section
  features_title VARCHAR(50),

  --card 1
  card1_H3 VARCHAR(50),
  card1_txt VARCHAR(255),

  -- card 2
  card2_H3 VARCHAR(50),
  card2_txt VARCHAR(255),

  -- card 3
  card3_H3 VARCHAR(50),
  card3_txt VARCHAR(255),

  -- testimonials (Added missing commas below)
  testimonials_title VARCHAR(50),
  testimonial_main_title VARCHAR(50),
  testimonial_txt VARCHAR(50), 

  --card 1
  testimonial_one VARCHAR(255),
  testimonial1_span1 VARCHAR(50),
  testimonial1_span2 VARCHAR(50),

  --card 2
  testimonial_two VARCHAR(255),
  testimonial2_span1 VARCHAR(50),
  testimonial2_span2 VARCHAR(50), 

  --card 3
  testimonial_three VARCHAR(255),
  testimonial3_span1 VARCHAR(50),
  testimonial3_span2 VARCHAR(50)
);
