// Load published posts
async function loadPosts() {
  try {
    const response = await fetch('/api/posts/public');
    const data = await response.json();

    const container = document.getElementById('postsContainer');

    if (response.ok && data.posts && data.posts.length > 0) {
      let html = '';
      data.posts.forEach(post => {
        const imageHtml = post.featuredImage ?
          `<img src="/${post.featuredImage}" alt="Featured Image">` : '';

        html += `
                    <div class="post">
                        <h2>${post.title}</h2>
                        <div class="post-meta">By: ${post.author ? post.author.name : 'Unknown'} | ${new Date(post.createdAt).toLocaleDateString()}</div>
                        ${imageHtml}
                        <div class="post-content">${post.content}</div>
                        <div>
                            ${post.tags && post.tags.length > 0 ? post.tags.map(t => `<span class="tags">#${t}</span>`).join('') : ''}
                        </div>
                    </div>
                `;
      });
      container.innerHTML = html;
    } else {
      container.innerHTML = `<div class="no-posts"> No published posts available.</div>`;
    }
  } catch (error) {
    document.getElementById('postsContainer').innerHTML =
      `<div class="error">Error loading posts: ${error.message}</div>`;
  }
}

// Load posts on page load
window.onload = loadPosts;