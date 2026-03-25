const navBarBtn = document.querySelector(".sidebar-btn");
const navItems = document.querySelector(".dashboard-sidebar");

navBarBtn.addEventListener("click", (e) => {
e.stopPropagation();
navItems.classList.toggle("sidebar-active");
});


window.addEventListener("click", (e) => {

if (!navItems.contains(e.target)) {
navItems.classList.remove("sidebar-active");
}
});



document.addEventListener('DOMContentLoaded', function() {
const propertyImagesInput = document.querySelector("#media"); 
const previewContainer = document.getElementById("imagePreviewContainer");
let storeImages = []; 
const MAX_IMAGES = 5;

previewContainer.style.display = "flex";
previewContainer.style.flexWrap = "wrap";
previewContainer.style.gap = "15px";
previewContainer.style.marginTop = "20px";

propertyImagesInput.addEventListener("change", function(e) {
const newFiles = Array.from(e.target.files);


if (storeImages.length + newFiles.length > MAX_IMAGES) {
alert(`You can only upload up to ${MAX_IMAGES} images. You have ${storeImages.length} already selected.`);
this.value = ""; 
return;
}


storeImages = [...storeImages, ...newFiles];


updateFileInput();


renderPreviews();
});

function renderPreviews() {

previewContainer.innerHTML = "";


storeImages.forEach((file, index) => {

const previewWrapper = document.createElement("div");
previewWrapper.style.position = "relative";
previewWrapper.style.width = "120px";
previewWrapper.style.height = "120px";


const img = document.createElement("img");
img.src = URL.createObjectURL(file);


img.style.width = "100%";
img.style.height = "100%";
img.style.objectFit = "cover";
img.style.borderRadius = "12px";
img.style.border = "3px solid #fff";
img.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
img.style.transition = "transform 0.2s";

// Hover effect
img.addEventListener('mouseenter', () => {
img.style.transform = 'scale(1.05)';
});
img.addEventListener('mouseleave', () => {
img.style.transform = 'scale(1)';
});


const removeBtn = document.createElement("button");
removeBtn.innerHTML = "×";
removeBtn.style.position = "absolute";
removeBtn.style.top = "-8px";
removeBtn.style.right = "-8px";
removeBtn.style.width = "25px";
removeBtn.style.height = "25px";
removeBtn.style.borderRadius = "50%";
removeBtn.style.background = "#ff4444";
removeBtn.style.color = "white";
removeBtn.style.border = "none";
removeBtn.style.fontSize = "18px";
removeBtn.style.fontWeight = "bold";
removeBtn.style.cursor = "pointer";
removeBtn.style.display = "flex";
removeBtn.style.alignItems = "center";
removeBtn.style.justifyContent = "center";
removeBtn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
removeBtn.style.transition = "background 0.2s";


removeBtn.addEventListener('mouseenter', () => {
removeBtn.style.background = "#cc0000";
});
removeBtn.addEventListener('mouseleave', () => {
removeBtn.style.background = "#ff4444";
});


removeBtn.addEventListener('click', function() {
removeImage(index);
});


const numberBadge = document.createElement("span");
numberBadge.textContent = index + 1;
numberBadge.style.position = "absolute";
numberBadge.style.bottom = "-8px";
numberBadge.style.left = "-8px";
numberBadge.style.width = "22px";
numberBadge.style.height = "22px";
numberBadge.style.borderRadius = "50%";
numberBadge.style.background = "#089c70";
numberBadge.style.color = "white";
numberBadge.style.border = "2px solid white";
numberBadge.style.fontSize = "12px";
numberBadge.style.fontWeight = "bold";
numberBadge.style.display = "flex";
numberBadge.style.alignItems = "center";
numberBadge.style.justifyContent = "center";
numberBadge.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";


previewWrapper.appendChild(img);
previewWrapper.appendChild(removeBtn);
previewWrapper.appendChild(numberBadge);
previewContainer.appendChild(previewWrapper);
});


updateCounter();
}

function removeImage(index) {

storeImages.splice(index, 1);


updateFileInput();


renderPreviews();
}

function updateFileInput() {

const dataTransfer = new DataTransfer();


storeImages.forEach(file => {
dataTransfer.items.add(file);
});


propertyImagesInput.files = dataTransfer.files;
}

function updateCounter() {

let counter = document.getElementById('imageCounter');
if (!counter) {
counter = document.createElement('div');
counter.id = 'imageCounter';
counter.style.marginTop = '10px';
counter.style.fontSize = '14px';
counter.style.color = '#666';
counter.style.fontWeight = '500';
previewContainer.parentNode.insertBefore(counter, previewContainer.nextSibling);
}

counter.innerHTML = `<i class="fas fa-images"></i> ${storeImages.length}/${MAX_IMAGES} images selected`;


if (storeImages.length === MAX_IMAGES) {
counter.style.color = '#28a745';
counter.style.fontWeight = 'bold';
} else {
counter.style.color = '#666';
counter.style.fontWeight = '500';
}
}


window.addEventListener('beforeunload', function() {
document.querySelectorAll('img[src^="blob:"]').forEach(img => {
URL.revokeObjectURL(img.src);
});
});
});


function changeMainImage(src, element) {

document.getElementById('mainImage').src = src;


document.querySelectorAll('.thumbnail').forEach(thumb => {
thumb.classList.remove('active');
});


element.classList.add('active');
}


let currentPage = 1;
let loading = false;
let hasMore = true;
const listingsGrid = document.querySelector('.listings-grid');
const loadingIndicator = document.getElementById('loadingIndicator');
const endMessage = document.getElementById('endMessage');


async function loadMoreListings() {
if (loading || !hasMore) return;

loading = true;
loadingIndicator.style.display = 'block';

try {
const nextPage = currentPage + 1;
const response = await fetch(`/api/listings?page=${nextPage}`);
const data = await response.json();

if (data.listings && data.listings.length > 0) {

data.listings.forEach(listing => {
let images = [];
try {
images = JSON.parse(listing.property_images || '[]');
} catch(e) {
images = [];
}
const firstImage = images.length > 0 ? images[0] : 'https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const listingHtml = `
<section class="house-section">
<a href="/house-details/${listing.id}">
<img src="${firstImage}" 
    alt="${listing.title}" 
    class="house-card-img"
    onerror="this.src='https://plus.unsplash.com/premium_photo-1689609950112-d66095626efb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'">

<h6>${listing.title}</h6>

<span class="house-cta">
<p>₦${Number(listing.amount).toLocaleString()}</p>
<p>${listing.houseType || listing.housetype}</p>
<p>${listing.city}</p>
</span>

<p class="house-info">
${listing.house_status === 'available' ? 'Available' : 'Sold'}
</p>


</a>
</section>
`;

listingsGrid.insertAdjacentHTML('beforeend', listingHtml);
});

currentPage = nextPage;
hasMore = data.hasMore;

if (!hasMore) {
endMessage.style.display = 'block';
loadingIndicator.style.display = 'none';
}
}
} catch (error) {
console.error('Error loading more listings:', error);
} finally {
loading = false;
loadingIndicator.style.display = 'none';
}
}


const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting && hasMore) {
loadMoreListings();
}
});
}, {
rootMargin: '200px', 
threshold: 0.1
});


const sentinel = document.createElement('div');
sentinel.id = 'scrollSentinel';
sentinel.style.height = '10px';
document.querySelector('.listings-wrapper').appendChild(sentinel);

// Observe the sentinel
observer.observe(sentinel);

// Add CSS for spinner
const style = document.createElement('style');
style.textContent = `
.spinner {
width: 40px;
height: 40px;
margin: 0 auto;
border: 4px solid #f3f3f3;
border-top: 4px solid #089c70;
border-radius: 50%;
animation: spin 1s linear infinite;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);


