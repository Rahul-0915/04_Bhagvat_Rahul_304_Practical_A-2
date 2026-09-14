// Get token from localStorage
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

let currentPostId = null;

// Set user name
if (user.name) {
  document.getElementById('userName').textContent = user.name;
}

// Check if user is logged in
if (!token) {
  window.location.href = '/login';
}

// Load posts on page load
window.onload = function () {
  loadPosts();
};

// Load all posts
async function loadPosts() {
  try {
    const response = await fetch('/api/posts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      displayPosts(data.posts);
    } else {
      document.getElementById('postsContainer').innerHTML =
        `<div class="error"> ${data.error || 'Failed to load posts'}</div>`;
    }
  } catch (error) {
    document.getElementById('postsContainer').innerHTML =
      `<div class="error"> Network error: ${error.message}</div>`;
  }
}

// Display posts
function displayPosts(posts) {
  const container = document.getElementById('postsContainer');

  if (!posts || posts.length === 0) {
    container.innerHTML = `<div class="no-posts"> No posts yet. Create your first post!</div>`;
    return;
  }

  let html = '';
  posts.forEach(post => {
    const statusClass = post.published ? 'status-published' : 'status-draft';
    const statusText = post.published ? 'Published' : ' Draft';
    const imageHtml = post.featuredImage ?
      `<div class="post-image-container"><img src="/${post.featuredImage}" alt="Featured Image"></div>` :
      `<div class="post-image-container"><em>No image uploaded</em></div>`;

    html += `
            <div class="post">
                <h3>${post.title}</h3>
                <span class="${statusClass}">${statusText}</span>
                ${imageHtml}
                <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                <div>
                    <button onclick="editPost('${post._id}')" class="btn btn-edit"> Edit</button>
                    <button onclick="deletePost('${post._id}')" class="btn btn-delete"> Delete</button>
                    <button onclick="showImageUpload('${post._id}')" class="btn btn-upload"> Upload Image</button>
                </div>
                <small>Created: ${new Date(post.createdAt).toLocaleDateString()}</small>
            </div>
        `;
  });

  container.innerHTML = html;
}

// EDIT POST - Open Modal with post data
async function editPost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      const post = data.post;
      document.getElementById('editTitle').value = post.title;
      document.getElementById('editContent').value = post.content;
      document.getElementById('editTags').value = post.tags ? post.tags.join(', ') : '';
      document.getElementById('editPublished').checked = post.published;

      // Store post ID for update
      document.getElementById('editForm').dataset.postId = postId;
      document.getElementById('editModal').style.display = 'block';
      document.getElementById('editMessage').innerHTML = '';
    } else {
      showMessage(' Failed to load post', 'error');
    }
  } catch (error) {
    showMessage(` Error: ${error.message}`, 'error');
  }
}

//  Close edit modal
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

//  Update Post
document.getElementById('editForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const postId = this.dataset.postId;
  const title = document.getElementById('editTitle').value;
  const content = document.getElementById('editContent').value;
  const tagsInput = document.getElementById('editTags').value;
  const published = document.getElementById('editPublished').checked;
  const messageDiv = document.getElementById('editMessage');

  if (!title || !content) {
    messageDiv.innerHTML = '<div class="error">Title and content are required</div>';
    return;
  }

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, tags, published })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.innerHTML = `<div class="success"> ${data.message}</div>`;
      setTimeout(() => {
        closeEditModal();
        loadPosts(); // Reload posts
      }, 1500);
    } else {
      messageDiv.innerHTML = `<div class="error"> ${data.error || 'Update failed'}</div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="error"> Network error: ${error.message}</div>`;
  }
});

// Show image upload modal
function showImageUpload(postId) {
  currentPostId = postId;
  document.getElementById('imageModal').style.display = 'block';
  document.getElementById('uploadMessage').innerHTML = '';
  document.getElementById('imageFile').value = '';
}

// Close image modal
function closeImageModal() {
  document.getElementById('imageModal').style.display = 'none';
  currentPostId = null;
}

// Upload image
document.getElementById('imageUploadForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById('imageFile');
  const file = fileInput.files[0];
  const messageDiv = document.getElementById('uploadMessage');

  if (!file) {
    messageDiv.innerHTML = '<div class="error">Please select an image</div>';
    return;
  }

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    messageDiv.innerHTML = '<div class="error">File too large. Maximum size is 2MB</div>';
    return;
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    messageDiv.innerHTML = '<div class="error">Only JPEG, PNG, and WEBP images are allowed</div>';
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`/api/posts/${currentPostId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.innerHTML = `<div class="success"> ${data.message}</div>`;
      setTimeout(() => {
        closeImageModal();
        loadPosts(); // Reload posts
      }, 1500);
    } else {
      messageDiv.innerHTML = `<div class="error"> ${data.error || 'Upload failed'}</div>`;
    }
  } catch (error) {
    messageDiv.innerHTML = `<div class="error"> Network error: ${error.message}</div>`;
  }
});

// Create post
async function createPost() {
  const title = document.getElementById('postTitle').value;
  const content = document.getElementById('postContent').value;
  const tagsInput = document.getElementById('postTags').value;
  const published = document.getElementById('postPublished').checked;

  if (!title || !content) {
    showMessage('Please fill in title and content', 'error');
    return;
  }

  const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, tags, published })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(' Post created successfully!', 'success');
      hideCreateForm();
      loadPosts();
    } else {
      showMessage(` ${data.error || 'Failed to create post'}`, 'error');
    }
  } catch (error) {
    showMessage(` Network error: ${error.message}`, 'error');
  }
}

// Delete post
async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) {
    return;
  }

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(' Post deleted successfully!', 'success');
      loadPosts();
    } else {
      showMessage(` ${data.error || 'Failed to delete post'}`, 'error');
    }
  } catch (error) {
    showMessage(` Network error: ${error.message}`, 'error');
  }
}

// Show create form
function showCreateForm() {
  document.getElementById('createForm').style.display = 'block';
}

// Hide create form
function hideCreateForm() {
  document.getElementById('createForm').style.display = 'none';
  document.getElementById('postTitle').value = '';
  document.getElementById('postContent').value = '';
  document.getElementById('postTags').value = '';
  document.getElementById('postPublished').checked = false;
}

// Show message
function showMessage(text, type) {
  const msgDiv = document.getElementById('message');
  const className = type === 'error' ? 'error' : 'success';
  msgDiv.innerHTML = `<div class="${className}">${text}</div>`;
  setTimeout(() => {
    msgDiv.innerHTML = '';
  }, 5000);
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}