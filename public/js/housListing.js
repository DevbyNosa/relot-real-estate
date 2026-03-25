// Apartment listing form validation
const parentElement = document.querySelector('.display-js');





function HousesListing(Image, description, price, location) {
  this.image = Image;
  this.description = description;
  this.price = price;
  this.location = location;
}

const houses = [new HousesListing("/images/first-apartment.jpg",
 "4 bedroom Apartment",
   760000,
   'Lagos, Lekki, Nigeria'),
   
   new HousesListing("/images/second-apartment.jpg",
    "3 bedroom Apartment",
    650000,
    "Ebony State, Abakaliki, Nigeria"),

    new HousesListing("/images/third-apartment.jpg",
      "2 bedroom Apartment",
    820000,
    `Rivers State, Port Harcourt, Nigeria`
   ),
  
  new HousesListing("/images/fourth-apartment.jpg",
    "3 bedroom Apartment",
    450000,
    'Edo State, Benin City, Nigeria'
  ),

  new HousesListing("/images/fifth-apartment.jpg",
    "Self Contain apartment",
    700000,
    "Gwagwalada Abuja, Nigeria"
  ), 

  new HousesListing("/images/6-bed.jpg", "6 bedroom apartment", 1400000, "Egbeda, Ibadan Nigeria"),

  new HousesListing("/images/ondo-apt.jpg", "4 bedroom apartment to let", 600000, "Ondo Akure, Nigeria"),

  new HousesListing("/images/bung-benin-city.jpg", "3 bdrm Bungalow", 1200000, "Benin City, Sakponba road, Nigeria"),

   new HousesListing("/images/dupl-lag.jpg", "Duplex 5 rooms", 3650000, "Lekki - Lagos Nigeria"),

    new HousesListing("/images/dupl-delt.jpg", "6 room duplex bedroom", 5000000, "Asaba Delta state Nigeria"),

    new HousesListing("/images/flat-abuja.jpg", "2 bdrm Flat", 950000, "Abuja, Wuse Zone 4, Nigeria"),

new HousesListing("/images/duplex-lagos.jpg", "4 bdrm Duplex", 2100000, "Lagos, Ikoyi, Nigeria"),

new HousesListing("/images/selfcon-ph.jpg", "Self Contain", 420000, "Port Harcourt, Rumuola, Nigeria"),


]
houses.forEach((house) => {
  const li = document.createElement('li');

  li.classList.add("house-card");
  li.innerHTML = `
    <img src="${house.image}">
    <h5>${house.description}</h5>
    <h3>₦${house.price}</h3>
    <p><i class="fa-solid fa-location-crosshairs"></i> ${house.location}</p>
  `;

  parentElement.appendChild(li);
});


const  inputElement = document.querySelectorAll('.input-listing');
const selectElement = document.querySelector('.apartment-listing');


