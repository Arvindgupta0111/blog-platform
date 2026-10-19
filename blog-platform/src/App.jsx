
import { useEffect, useState } from 'react';
import './App.css';
import api from './api/axios';

const blogs = [
  { id: 1, category: 'Technology', title: 'The Future of Artificial Intelligence', description: 'Explore how AI is transforming our daily lives, businesses, and the future of technology.', author: 'Rahul Sharma', date: 'Oct 12, 2026', read: '5 min read', image: 'photo-1677442136019-21780ecad995' },
  { id: 2, category: 'Programming', title: 'Getting Started with React.js', description: 'Learn React fundamentals and start building modern web applications.', author: 'Priya Verma', date: 'Oct 10, 2026', read: '7 min read', image: 'photo-1498050108023-c5249f4df085' },
  { id: 3, category: 'Lifestyle', title: 'Building Habits for a Better Life', description: 'Simple daily habits that can improve productivity and personal growth.', author: 'Aman Singh', date: 'Oct 08, 2026', read: '4 min read', image: 'photo-1499209974431-9dddcece7f88' },
  { id: 4, category: 'Technology', title: 'Understanding Web Development', description: 'A beginner-friendly guide to frontend, backend, APIs and full-stack development.', author: 'Neha Gupta', date: 'Oct 05, 2026', read: '6 min read', image: 'photo-1519389950473-47ba0277781c' },
  { id: 5, category: 'Programming', title: 'Why Every Developer Should Learn Git', description: 'Discover how version control makes teamwork easier and keeps code safe.', author: 'Vikas Kumar', date: 'Oct 02, 2026', read: '5 min read', image: 'photo-1556075798-4825dfaaf498' },
  { id: 6, category: 'Lifestyle', title: 'How to Stay Focused While Studying', description: 'Practical techniques for students to manage time and study effectively.', author: 'Anjali Roy', date: 'Sep 28, 2026', read: '3 min read', image: 'photo-1434030216411-0b793f4b4173' },
]

const categories = ['All', 'Technology', 'Programming', 'Lifestyle']

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [page, setPage] = useState('home')
  const [notice, setNotice] = useState('')
  const [posts, setPosts] = useState(blogs)
  
const [loadingBlogs, setLoadingBlogs] = useState(true);
const [blogError, setBlogError] = useState('');

useEffect(() => {
  async function fetchBlogs() {
    try {
      setLoadingBlogs(true);
      setBlogError('');

      const response = await api.get('/blogs');

      const blogList = Array.isArray(response.data)
        ? response.data
        : response.data.blogs || [];

      const formattedBlogs = blogList.map((blog) => ({
        ...blog,
        id: blog._id,
        author:
          typeof blog.author === 'object'
            ? blog.author?.name || 'Writer'
            : blog.author || 'Writer',
        date: blog.createdAt
          ? new Date(blog.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })
          : '',
        read: '3 min read',
        image: 'photo-1455390582262-044cdead277a',
      }));

      setPosts(formattedBlogs);
    } catch (error) {
      setBlogError(
        error.response?.data?.message ||
          'Blogs load nahi ho paye. Backend check karo.'
      );
    } finally {
      setLoadingBlogs(false);
    }
  }

  fetchBlogs();
}, []);

const [editor, setEditor] = useState(null)
const [formData, setFormData] = useState({
  title: '',
  category: 'Technology',
  description: '',
  author: 'Guest Writer',
})
const [comments, setComments] = useState({})
const [commentText, setCommentText] = useState('')

 const filteredBlogs = posts.filter(blog =>
  (category === 'All' || blog.category === category) &&
  `${blog.title} ${blog.description}`
    .toLowerCase()
    .includes(search.toLowerCase())
)
  
async function handleAuth(event) {
  event.preventDefault();
  setNotice('');

  const form = new FormData(event.currentTarget);
  const email = form.get('email');
  const password = form.get('password');
  const name = form.get('name');

  if (password.length < 6) {
    setNotice('Password must be at least 6 characters.');
    return;
  }

  if (page === 'register' && password !== form.get('confirmPassword')) {
    setNotice('Passwords do not match.');
    return;
  }

  try {
    const response =
      page === 'register'
        ? await api.post('/auth/register', { name, email, password })
        : await api.post('/auth/login', { email, password });

    localStorage.setItem('token', response.data.token);

    setNotice(
      page === 'login'
        ? 'Login successful!'
        : 'Registration successful!'
    );

    setPage('home');
  } catch (error) {
    setNotice(
      error.response?.data?.message ||
        'Authentication failed. Check backend and credentials.'
    );
  }
}

  function openEditor(post = null) {
  setEditor(post ? 'edit' : 'create')
  setFormData(post ? {
    title: post.title,
    category: post.category,
    description: post.description,
    author: post.author,
    id: post.id,
  } : {
    title: '',
    category: 'Technology',
    description: '',
    author: 'Guest Writer',
  })
  setNotice('')
}


async function savePost(event) {
  event.preventDefault();

  if (
    formData.title.trim().length < 3 ||
    formData.description.trim().length < 10
  ) {
    setNotice(
      'Title must be 3+ characters and description 10+ characters.'
    );
    return;
  }

  try {
    setNotice('Saving blog...');

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
    };

    if (editor === 'edit') {
      await api.put(`/blogs/${formData.id}`, payload);
      setNotice('Blog updated successfully!');
    } else {
      await api.post('/blogs', payload);
      setNotice('Blog created successfully!');
    }

    const response = await api.get('/blogs');

    const blogList = Array.isArray(response.data)
      ? response.data
      : response.data.blogs || [];

    const formattedBlogs = blogList.map((blog) => ({
      ...blog,
      id: blog._id,
      author:
        typeof blog.author === 'object'
          ? blog.author?.name || 'Writer'
          : blog.author || 'Writer',
      date: blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })
        : '',
      read: '3 min read',
      image: 'photo-1455390582262-044cdead277a',
    }));

    setPosts(formattedBlogs);
    setEditor(null);
  } catch (error) {
    setNotice(
      error.response?.data?.message ||
        'Blog save nahi hua. Login aur backend check karo.'
    );
  }
}


async function deletePost(id) {
  if (!window.confirm('Are you sure you want to delete this post?')) {
    return;
  }

  try {
    await api.delete(`/blogs/${id}`);

    setPosts((current) =>
      current.filter((post) => post.id !== id)
    );

    setSelectedBlog(null);
    setNotice('Blog deleted successfully!');
  } catch (error) {
    setNotice(
      error.response?.data?.message ||
        'Blog delete nahi hua. Login aur permissions check karo.'
    );
  }
}

useEffect(() => {
  if (!selectedBlog?.id) return;

  async function fetchComments() {
    try {
      const response = await api.get(
        `/comments/blog/${selectedBlog.id}`
      );

      const commentList = response.data.comments || [];

      setComments((current) => ({
        ...current,
        [selectedBlog.id]: commentList.map((comment) => ({
          id: comment._id,
          text: comment.content,
          author: comment.author?.name || 'Reader',
        })),
      }));
    } catch (error) {
      setNotice(
        error.response?.data?.message ||
          'Comments load nahi ho paye.'
      );
    }
  }

  fetchComments();
}, [selectedBlog?.id]);



async function addComment(event) {
  event.preventDefault();

  if (!selectedBlog || !commentText.trim()) return;

  try {
    const response = await api.post(
      `/comments/blog/${selectedBlog.id}`,
      { content: commentText.trim() }
    );

    const newComment = response.data.comment;

    setComments((current) => ({
      ...current,
      [selectedBlog.id]: [
        ...(current[selectedBlog.id] || []),
        {
          id: newComment._id,
          text: newComment.content,
          author: newComment.author?.name || 'Reader',
        },
      ],
    }));

    setCommentText('');
    setNotice('Comment added successfully!');
  } catch (error) {
    setNotice(
      error.response?.data?.message ||
        'Comment add nahi hua. Login karke dobara try karo.'
    );
  }
}

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#home" onClick={() => setPage('home')}>Blog<span>Space.</span></a>
        <nav>
          <a href="#home" onClick={() => setPage('home')}>Home</a>
          <a href="#blogs" onClick={() => setPage('home')}>Explore Blogs</a>
          <a href="#about" onClick={() => setPage('home')}>About</a>
        </nav>
        <button
  className="nav-button"
  onClick={() => openEditor()}
>
  + Create Blog
</button>
        <button className="nav-button" onClick={() => { setPage('login'); setNotice('') }}>Login / Sign up</button>
      </header>

      {page === 'login' || page === 'register' ? (
        <main className="auth-page">
          <div className="auth-card">
            <a className="logo auth-logo" href="#home" onClick={() => { setPage('home'); setNotice('') }}>Blog<span>Space.</span></a>
            <span className="eyebrow">WELCOME TO OUR COMMUNITY</span>
            <h1>{page === 'login' ? 'Welcome back!' : 'Create your account'}</h1>
            <p className="auth-subtitle">
              {page === 'login' ? 'Sign in to continue reading and sharing.' : 'Join our community of curious minds.'}
            </p>

            <form className="auth-form" onSubmit={handleAuth}>
              {page === 'register' && (
                <label>
                  Full name
                  <input name="name" type="text" placeholder="Enter your name" required minLength={2} />
                </label>
              )}
              <label>
                Email address
                <input name="email" type="email" placeholder="you@example.com" required />
              </label>
              <label>
                Password
                <input name="password" type="password" placeholder="At least 6 characters" required minLength={6} />
              </label>
              {page === 'register' && (
                <label>
                  Confirm password
                  <input name="confirmPassword" type="password" placeholder="Re-enter your password" required minLength={6} />
                </label>
              )}
              <button className="primary-button auth-submit" type="submit">
                {page === 'login' ? 'Sign In' : 'Create Account'} →
              </button>
            </form>

            {notice && <p className="auth-notice" role="status">{notice}</p>}

            <p className="auth-switch">
              {page === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button onClick={() => { setPage(page === 'login' ? 'register' : 'login'); setNotice('') }}>
                {page === 'login' ? 'Sign up' : 'Login'}
              </button>
            </p>
            <button className="back-home" onClick={() => { setPage('home'); setNotice('') }}>← Back to homepage</button>
          </div>
        </main>
      ) : (
        <main>
          <section className="hero" id="home">
            <div className="hero-content">
              <span className="eyebrow">✦ YOUR IDEAS, YOUR SPACE</span>
              <h1>Stories that<br /><span>inspire the world.</span></h1>
              <p>Discover fresh perspectives, share your knowledge, and connect with a community of curious minds.</p>
              <div className="hero-actions">
                <a className="primary-button" href="#blogs">Explore Articles →</a>
                <button className="secondary-button" onClick={() => setPage('register')}>Join Community</button>
              </div>
              <div className="hero-stats">
                <div><strong>1,200+</strong><span>Articles</span></div>
                <div><strong>850+</strong><span>Writers</span></div>
                <div><strong>10k+</strong><span>Readers</span></div>
              </div>
            </div>
            <div className="hero-image">
              <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=85" alt="Writing in a notebook" />
              <div className="floating-note"><span>✍️</span><div><strong>Share your story</strong><p>Your voice matters.</p></div></div>
            </div>
          </section>

          <section className="blog-section" id="blogs">
            <div className="section-heading">
              <div><span className="eyebrow">OUR LATEST STORIES</span><h2>Explore our blogs<span>.</span></h2><p>Ideas worth reading. Stories worth sharing.</p></div>
              <div className="blog-count">{filteredBlogs.length} articles</div>
            </div>

            <div className="filters">
              <div className="category-list">
                {categories.map(item => (
                  <button key={item} className={category === item ? 'category active' : 'category'} onClick={() => setCategory(item)}>{item}</button>
                ))}
              </div>
              <input className="search-input" type="search" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
{loadingBlogs && <p>Loading blogs...</p>}

{blogError && (
  <p role="alert">{blogError}</p>
)}
            <div className="blog-grid">
              {filteredBlogs.map(blog => (
                <article className="blog-card" key={blog.id}>
                  <div className="card-image">
                    <img src={`https://images.unsplash.com/${blog.image}?auto=format&fit=crop&w=900&q=80`} alt={blog.title} loading="lazy" />
                    <span className="card-category">{blog.category}</span>
                  </div>
                  <div className="card-content">
                    <div className="card-meta"><span>{blog.date}</span><span>{blog.read}</span></div>
                    <h3>{blog.title}</h3><p>{blog.description}</p>
                    <div className="card-bottom">
                      <div className="author"><div className="avatar">{blog.author.charAt(0)}</div><span>{blog.author}</span></div>
                      <button className="read-button" onClick={() => setSelectedBlog(blog)}>Read article ↗</button>
                      <div className="post-actions">
  <button onClick={() => openEditor(blog)}>Edit</button>
  <button className="delete-action" onClick={() => deletePost(blog.id)}>
    Delete
  </button>
</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredBlogs.length === 0 && <div className="empty-state"><h3>No articles found</h3><button className="primary-button" onClick={() => { setSearch(''); setCategory('All') }}>Clear filters</button></div>}
          </section>

          <section className="about-section" id="about">
            <span className="eyebrow">WHY BLOGSPACE?</span>
            <h2>A place where every idea has a home.</h2>
            <p>Read insightful stories, learn new skills, and get inspired by people who love sharing what they know.</p>
            <button className="primary-button" onClick={() => setPage('register')}>Join BlogSpace →</button>
          </section>
        </main>
      )}
      {editor && (
  <div className="modal-backdrop">
    <form className="article-modal editor-form" onSubmit={savePost}>
      <button
        type="button"
        className="modal-close"
        onClick={() => setEditor(null)}
      >
        ×
      </button>

      <h2>{editor === 'edit' ? 'Edit Blog' : 'Create New Blog'}</h2>

      <label>Blog title
        <input
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          required
          minLength={3}
          placeholder="Enter blog title"
        />
      </label>

      <label>Category
        <select
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
        >
          <option>Technology</option>
          <option>Programming</option>
          <option>Lifestyle</option>
        </select>
      </label>

      <label>Description
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          required
          minLength={10}
          rows={5}
          placeholder="Write your blog description"
        />
      </label>

      <label>Author name
        <input
          value={formData.author}
          onChange={e => setFormData({ ...formData, author: e.target.value })}
          required
        />
      </label>
{notice && (
  <p role="status" style={{ color: 'red' }}>
    {notice}
  </p>
)}
      <button className="primary-button" type="submit">
        {editor === 'edit' ? 'Save Changes' : 'Publish Blog'}
      </button>
    </form>
  </div>
)}

      <footer className="footer">
        <a className="logo" href="#home" onClick={() => setPage('home')}>Blog<span>Space.</span></a>
        <p>Built for readers. Inspired by writers.</p>
        <span>© 2026 BlogSpace. All rights reserved.</span>
      </footer>

      {selectedBlog && page === 'home' && (
        <div className="modal-backdrop" onClick={() => setSelectedBlog(null)}>
          <article className="article-modal" onClick={event => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedBlog(null)}>×</button>
            <img src={`https://images.unsplash.com/${selectedBlog.image}?auto=format&fit=crop&w=900&q=80`} alt={selectedBlog.title} />
            <span className="eyebrow">{selectedBlog.category}</span>
            <h2>{selectedBlog.title}</h2>
            <p className="modal-meta">By {selectedBlog.author} · {selectedBlog.date} · {selectedBlog.read}</p>
            <p>{selectedBlog.description}</p>
            <p>This is a sample article preview. Full articles and real comments will be connected to the backend in a later step.</p>
            <h3>Comments ({(comments[selectedBlog.id] || []).length})</h3>

<div className="comments-list">
  {(comments[selectedBlog.id] || []).map(comment => (
    <div className="comment-item" key={comment.id}>
      <strong>{comment.author}</strong>
      <p>{comment.text}</p>
    </div>
  ))}

  {(comments[selectedBlog.id] || []).length === 0 && (
    <p>No comments yet. Be the first to comment!</p>
  )}
</div>

<form className="comment-form" onSubmit={addComment}>
  <textarea
    value={commentText}
    onChange={event => setCommentText(event.target.value)}
    placeholder="Write your comment..."
    rows={3}
    maxLength={500}
    required
  />
  {notice && <p role="status">{notice}</p>}
  <button className="primary-button" type="submit">
    Post Comment
  </button>
</form>
            <button className="primary-button" onClick={() => setSelectedBlog(null)}>Back to articles</button>
          </article>
        </div>
      )}
    </div>
  )
}

export default App
