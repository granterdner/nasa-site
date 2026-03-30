// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const button = document.getElementById('getImagesBtn');

// Modal elements
const modal = document.getElementById('imageModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');

// Set up date inputs from dateRange.js
setupDateInputs(startInput, endInput);

// Replace with your real NASA API key when ready
const API_KEY = "XrWRoTq6UixMYIiw4CiP7McN1L2DFnNuccPfYhzJ";

// Fetch APOD data for selected range
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showMessage("Please select both a start date and an end date.");
    return;
  }

  if (startDate > endDate) {
    showMessage("Start date cannot be after end date.");
    return;
  }

  showLoading();

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data.reverse() : [data];

    renderGallery(items);
  } catch (error) {
    console.error("Error fetching APOD data:", error);
    showMessage("Sorry, something went wrong while loading NASA space photos.");
  }
}

// Render gallery items
function renderGallery(items) {
  if (!items.length) {
    showMessage("No space photos found for that date range.");
    return;
  }

  gallery.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "space-card";

    // APOD can return videos too, but your gallery requirement is image-focused
    // so we handle both gracefully
    let mediaHTML = "";

    if (item.media_type === "image") {
      mediaHTML = `
        <img
          src="${item.url}"
          alt="${item.title}"
          class="space-media"
        />
      `;
    } else if (item.media_type === "video") {
      mediaHTML = `
        <div class="video-fallback">
          <p>🎥 Video available for this date</p>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer">Open video</a>
        </div>
      `;
    } else {
      mediaHTML = `
        <div class="video-fallback">
          <p>Media unavailable</p>
        </div>
      `;
    }

    card.innerHTML = `
      ${mediaHTML}
      <div class="card-content">
        <h2>${item.title}</h2>
        <p class="date">${item.date}</p>
      </div>
    `;

    card.addEventListener("click", () => openModal(item));

    gallery.appendChild(card);
  });
}

// Open modal
function openModal(item) {
  let mediaHTML = "";

  if (item.media_type === "image") {
    mediaHTML = `
      <img
        src="${item.hdurl || item.url}"
        alt="${item.title}"
        class="modal-image"
      />
    `;
  } else if (item.media_type === "video") {
    mediaHTML = `
      <div class="modal-video-message">
        <p>This APOD entry is a video.</p>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer">Watch it here</a>
      </div>
    `;
  }

  modalBody.innerHTML = `
    ${mediaHTML}
    <div class="modal-text">
      <h2>${item.title}</h2>
      <p class="date">${item.date}</p>
      <p>${item.explanation}</p>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

// Close modal
function closeModal() {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

// Loading state
function showLoading() {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;
}

// Generic message state
function showMessage(message) {
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔭</div>
      <p>${message}</p>
    </div>
  `;
}

// Event listeners
button.addEventListener("click", getSpaceImages);
closeModalBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

// Load default images on page load
getSpaceImages();
