const html         = document.documentElement;
const grid         = document.getElementById("grid");
const loading      = document.getElementById("loading");
const searchInput  = document.getElementById("search");
const btnSearch    = document.getElementById("btn-search");
const toggleNSFW   = document.getElementById("toggle-nsfw");
const modal        = document.getElementById("modal");
const bigImg       = document.getElementById("big-img");
const btnDownload  = document.getElementById("btn-download");
const closeBtn     = modal.querySelector(".close-btn");

let page      = 1;
let isLoading = false;
let nsfw      = localStorage.getItem("nsfw") === "true";
let observer  = null;

function setTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  document.querySelectorAll(".color-swatch").forEach(el => {
    el.classList.toggle("active", el.dataset.theme === theme);
  });
}

setTheme(localStorage.getItem("theme") || "dark");

document.getElementById("btn-theme").onclick = e => {
  e.stopPropagation();
  document.getElementById("theme-panel").classList.toggle("open");
};

document.getElementById("theme-panel").onclick = e => {
  e.stopPropagation();
  if (e.target.classList.contains("color-swatch")) {
    setTheme(e.target.dataset.theme);
    document.getElementById("theme-panel").classList.remove("open");
  }
};

document.onclick = () => {
  document.getElementById("theme-panel").classList.remove("open");
};

toggleNSFW.classList.toggle("active", nsfw);
toggleNSFW.querySelector(".material-icons").textContent = nsfw ? "visibility_off" : "visibility";

toggleNSFW.onclick = () => {
  nsfw = !nsfw;
  localStorage.setItem("nsfw", nsfw);
  toggleNSFW.classList.toggle("active", nsfw);
  toggleNSFW.querySelector(".material-icons").textContent = nsfw ? "visibility_off" : "visibility";
  reset();
};

btnSearch.onclick = reset;
searchInput.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); reset(); } };
document.getElementById("home-btn").onclick = reset;
closeBtn.onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };

let rafPending = false;
window.addEventListener("scroll", () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 600 && !isLoading) {
      load();
    }
  });
}, { passive: true });

observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: "300px 0px" });

function getTags() {
  let tags = searchInput.value.trim();
  return tags;
}

async function load() {
  if (isLoading) return;
  isLoading = true;
  loading.classList.add("active");

  const tags = getTags();
  const url = `/api/posts?page=${page}&tags=${encodeURIComponent(tags)}&_=${Date.now()}`;

  let posts;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error();
    posts = await res.json();
  } catch {
    loading.innerHTML = "<div style='color:var(--text);font-size:1.2rem;'>Connection error</div>";
    setTimeout(() => loading.classList.remove("active"), 1800);
    isLoading = false;
    return;
  }

  if (!posts.length) {
    loading.innerHTML = "<div style='color:var(--text);font-size:1.2rem;'>No more posts</div>";
    setTimeout(() => loading.classList.remove("active"), 1400);
    isLoading = false;
    return;
  }

  posts.forEach(post => {
    if ((!nsfw && post.rating !== "s") || (nsfw && post.rating === "s")) return;
    addPostCard(post);
  });

  page++;
  isLoading = false;
  setTimeout(() => loading.classList.remove("active"), 400);
}

function addPostCard(post) {
  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = post.preview_url || "https://via.placeholder.com/140?text=?";
  img.loading = "lazy";
  img.alt = "";
  img.onclick = () => openModal(post);
  card.appendChild(img);

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const wrapper = document.createElement("div");
  wrapper.className = "filename-wrapper";

  const filename = document.createElement("div");
  filename.className = "filename";

  const ext = (post.file_url.match(/\.(\w+)(\?|$)/)?.[1] || "jpg");
  const cleanTags = (post.tags || "").replace(/\s+/g, "_").slice(0, 48);
  const fileNameText = `yande_\( {post.id}_ \){cleanTags}.${ext}`;
  filename.textContent = fileNameText;

  wrapper.appendChild(filename);
  footer.appendChild(wrapper);

  const dlBtn = document.createElement("button");
  dlBtn.className = "dl-btn material-icons";
  dlBtn.textContent = "download";
  dlBtn.onclick = e => {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = `/api/view?url=${encodeURIComponent(post.file_url)}`;
    a.download = fileNameText;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  footer.appendChild(dlBtn);

  card.appendChild(footer);
  grid.appendChild(card);

  observer.observe(card);

  setTimeout(() => {
    const w = wrapper.offsetWidth;
    const t = filename.offsetWidth;
    if (t > w + 10) {
      let pos = 0;
      const step = () => {
        pos -= 0.4;
        if (-pos > t) pos = w;
        filename.style.transform = `translateX(${pos}px)`;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, 300);
}

function reset() {
  page = 1;
  grid.classList.add("fading-out");

  setTimeout(() => {
    grid.innerHTML = "";
    grid.classList.remove("fading-out");
    window.scrollTo({ top: 0, behavior: "instant" });
    loading.classList.add("active");
    load();
  }, 600);
}

function openModal(post) {
  const hdUrl = post.sample_url || post.file_url;
  bigImg.src = post.preview_url || "";
  document.getElementById("hd-loader").style.display = "flex";

  const proxy = `/api/view?url=${encodeURIComponent(hdUrl)}`;
  const imgLoader = new Image();
  imgLoader.onload = () => {
    bigImg.src = proxy;
    document.getElementById("hd-loader").style.display = "none";
  };
  imgLoader.src = proxy;

  btnDownload.onclick = () => {
    const ext = (post.file_url.match(/\.(\w+)(\?|$)/)?.[1] || "jpg");
    const clean = (post.tags || "").replace(/\s+/g, "_").slice(0, 48);
    const fname = `yande_\( {post.id}_ \){clean}.${ext}`;

    const a = document.createElement("a");
    a.href = `/api/view?url=${encodeURIComponent(post.file_url)}`;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 20);
}

function closeModal() {
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    bigImg.src = "";
    document.getElementById("hd-loader").style.display = "none";
  }, 400);
}

load();