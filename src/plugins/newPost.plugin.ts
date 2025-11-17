import { PluginManager } from '../common/pluginManager';

PluginManager.register({
  name: 'newPost',

  render: (): Promise<string> => {
    const html = `
      <style>
        /* Emoji Picker Styles */
        .emoji-picker {
          position: absolute;
          bottom: 100%;
          left: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 12px;
          display: none;
          grid-template-columns: repeat(8, 1fr);
          gap: 8px;
          margin-bottom: 8px;
          z-index: 1000;
          max-width: 320px;
        }

        .emoji-picker.active {
          display: grid;
        }

        .emoji-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .emoji-btn:hover {
          background: rgba(0,0,0,0.05);
          transform: scale(1.2);
        }

        /* 🌈 Gen Z Pastel + Glassmorphism */
        .add-post {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 16px;
          margin: 16px auto;
          width: 100%;
          max-width: 550px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          font-family: "Poppins", sans-serif;
          transition: transform 0.2s ease;
        }

        .add-post:hover { transform: translateY(-2px); }

        .post-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fcb045, #fd1d1d, #833ab4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        #new-post-username {
          flex: 1;
          border: none;
          outline: none;
          background: rgba(255, 255, 255, 0.5);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          color: #333;
        }

        #new-post-content {
          width: 100%;
          border: none;
          outline: none;
          resize: none;
          padding: 12px;
          border-radius: 12px;
          font-size: 15px;
          background: rgba(255, 255, 255, 0.6);
          color: #222;
          margin-bottom: 12px;
          min-height: 80px;
          transition: background 0.2s ease;
        }

        #new-post-content:focus {
          background: rgba(255, 255, 255, 0.8);
        }

        .post-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .post-tools {
          display: flex;
          gap: 10px;
        }

        .tool-button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          transition: transform 0.2s;
        }

        .tool-button:hover {
          transform: scale(1.2);
        }

        #submit-post {
          background: linear-gradient(135deg, #a1c4fd, #c2e9fb);
          border: none;
          padding: 10px 18px;
          border-radius: 50px;
          cursor: pointer;
          color: #222;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
          box-shadow: 0 4px 10px rgba(161, 196, 253, 0.5);
        }

        #submit-post:hover {
          background: linear-gradient(135deg, #c2e9fb, #a1c4fd);
          transform: translateY(-2px);
        }

        .image-preview {
          margin-top: 10px;
          display: none;
        }

        .image-preview img {
          width: 100%;
          border-radius: 12px;
          max-height: 250px;
          object-fit: cover;
          margin-top: 8px;
        }

        .post-notification {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 500;
          color: #333;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          animation: fadeInOut 3s ease;
          max-width: 80%;
          text-align: center;
          line-height: 1.5;
        }
        
        .post-notification.error {
          background: linear-gradient(135deg, #ff4444, #ff0000);
          color: white;
          font-weight: 600;
          box-shadow: 0 8px 20px rgba(255, 0, 0, 0.2);
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px) translateX(-50%); }
          10% { opacity: 1; transform: translateY(0) translateX(-50%); }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translateY(10px) translateX(-50%); }
        }
      </style>

      <div class="add-post">
        <textarea id="new-post-content" placeholder="Apa yang sedang Anda pikirkan? 🌸" rows="3"></textarea>
        
        <!-- 📸 Preview foto -->
        <div class="image-preview" id="image-preview">
          <img id="preview-img" src="" alt="Preview Foto">
        </div>

        <div class="post-actions">
          <div class="post-tools">
            <button class="tool-button" id="photo-btn" title="Tambah Gambar">📷</button>
            <input type="file" id="image-input" accept="image/*" style="display:none;">
            <div style="position: relative;">
              <button class="tool-button" id="emoji-btn" title="Tambah Emoji">😊</button>
              <div class="emoji-picker" id="emoji-picker">
                <!-- Common emojis -->
                <button class="emoji-btn">😊</button>
                <button class="emoji-btn">😂</button>
                <button class="emoji-btn">❤️</button>
                <button class="emoji-btn">👍</button>
                <button class="emoji-btn">🔥</button>
                <button class="emoji-btn">✨</button>
                <button class="emoji-btn">🎉</button>
                <button class="emoji-btn">🌟</button>
                <button class="emoji-btn">💕</button>
                <button class="emoji-btn">🥰</button>
                <button class="emoji-btn">😍</button>
                <button class="emoji-btn">🤗</button>
                <button class="emoji-btn">👋</button>
                <button class="emoji-btn">🎨</button>
                <button class="emoji-btn">🌈</button>
                <button class="emoji-btn">🌺</button>
                <button class="emoji-btn">🍀</button>
                <button class="emoji-btn">🌸</button>
                <button class="emoji-btn">⭐</button>
                <button class="emoji-btn">💫</button>
                <button class="emoji-btn">💝</button>
                <button class="emoji-btn">💖</button>
                <button class="emoji-btn">💯</button>
                <button class="emoji-btn">🎵</button>
              </div>
            </div>
          </div>
          <button id="submit-post" type="button">
            <span class="button-content">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Posting
            </span>
          </button>
        </div>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const photoBtn = document.getElementById('photo-btn');
          const imageInput = document.getElementById('image-input');
          const previewContainer = document.getElementById('image-preview');
          const previewImg = document.getElementById('preview-img');
          const submitBtn = document.getElementById('submit-post');

          // Tambahkan tombol Edit dan Hapus di setiap post milik user
          const addOwnerControls = (div, postId, content) => {
            const actionsEl = div.querySelector('.post-actions');
            if (!actionsEl) return;

            // Hindari duplikasi tombol
            if (actionsEl.querySelector('.edit-btn') || actionsEl.querySelector('.delete-btn')) return;

            const editBtn = document.createElement('button');
            editBtn.className = 'tool-button edit-btn';
            editBtn.dataset.id = postId;
            editBtn.dataset.content = content;
            editBtn.textContent = '✏️ Edit';
            actionsEl.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'tool-button delete-btn';
            delBtn.dataset.id = postId;
            delBtn.textContent = '🗑️ Hapus';
            actionsEl.appendChild(delBtn);
          };

          // ==================== GLOBAL EVENT HANDLER ====================

          let currentEditId = null;
          let currentDeleteId = null;

          document.addEventListener('click', (e) => {
            const target = e.target;

            // ✏️ Tombol Edit diklik
            if (target.classList.contains('edit-btn')) {
              currentEditId = target.dataset.id;
              document.getElementById('editContent').value = target.dataset.content;
              document.getElementById('editModal').style.display = 'flex';
            }

            // 🗑️ Tombol Hapus diklik
            if (target.classList.contains('delete-btn')) {
              currentDeleteId = target.dataset.id;
              document.getElementById('deleteModal').style.display = 'flex';
            }
          });

          // Tutup modal
          document.getElementById('cancelEdit').onclick = () =>
            (document.getElementById('editModal').style.display = 'none');

          document.getElementById('cancelDelete').onclick = () =>
            (document.getElementById('deleteModal').style.display = 'none');

          // Simpan hasil edit
          document.getElementById('saveEdit').onclick = async () => {
            const newContent = document.getElementById('editContent').value.trim();
            if (!newContent) return alert('Isi tidak boleh kosong!');

            const currentUser = JSON.parse(localStorage.getItem('user'));
            const name = currentUser?.name || currentUser?.username || 'Kamu';
            const username = currentUser?.username || currentUser?.handle || '';

            const res = await fetch('/posts/' + currentEditId, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'x-username': username },
              body: JSON.stringify({ content: newContent, name, username }),
            });

            if (res.ok) {
              document.getElementById('editModal').style.display = 'none';
              location.reload();
            } else {
              alert('❌ Gagal update.');
            }
          };

          // Konfirmasi hapus
          document.getElementById('confirmDelete').onclick = async () => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const name = currentUser?.name || currentUser?.username || 'Kamu';
            const username = currentUser?.username || currentUser?.handle || '';

            const res = await fetch('/posts/' + currentDeleteId, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json', 'x-username': username },
              body: JSON.stringify({ name, username }),
            });

            if (res.ok) {
              document.getElementById('deleteModal').style.display = 'none';
              location.reload();
            } else {
              alert('❌ Gagal hapus.');
            }
          };

          // Klik luar modal untuk menutup
          window.onclick = (e) => {
            if (e.target.classList.contains('modal')) e.target.style.display = 'none';
          };


          // ==================== 📸 IMAGE UPLOAD HANDLER ====================
          photoBtn.addEventListener('click', () => imageInput.click());

          imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              previewImg.src = ev.target.result;
              previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
          });

          // ==================== 😊 EMOJI PICKER HANDLER ====================
          const emojiBtn = document.getElementById('emoji-btn');
          const emojiPicker = document.getElementById('emoji-picker');
          const contentEl = document.getElementById('new-post-content');

          // small helper to show relative time for newly created posts
          const timeAgo = (dateString) => {
            if (!dateString) return 'Baru saja';
            const date = new Date(dateString);
            const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
            const intervals = {
              tahun: 31536000,
              bulan: 2592000,
              minggu: 604800,
              hari: 86400,
              jam: 3600,
              menit: 60,
            };
            for (const unit in intervals) {
              const value = intervals[unit];
              const amount = Math.floor(seconds / value);
              if (amount >= 1) return amount + ' ' + unit + ' yang lalu';
            }
            return 'Baru saja';
          };

          // Toggle tampil/hidden
          emojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            emojiPicker.classList.toggle('active');
          });

          // Klik emoji → tambahkan ke textarea
          emojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              contentEl.value += btn.textContent;
              emojiPicker.classList.remove('active');
            });
          });

          // Klik di luar picker → tutup
          document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
              emojiPicker.classList.remove('active');
            }
          });


          // 🚀 SUBMIT postingan — ✅ kirim username
          if (submitBtn) {
            submitBtn.addEventListener('click', async (ev) => {
              try {
                ev?.preventDefault?.();
              } catch {}
              // Read content and user first, then log and send
              const contentEl = document.getElementById('new-post-content');
              const content = contentEl?.value?.trim();
              const previewContainer = document.getElementById('image-preview');
              const image = previewContainer?.style?.display === 'block' ? previewImg?.src : null;
              if (!content && !image) return;

              const currentUser = JSON.parse(localStorage.getItem('user'));
              // New DB schema: name = full name, username = handle (e.g. @elonmusk)
              const name = currentUser?.name || currentUser?.username || 'Kamu';
              const username = currentUser?.username || currentUser?.handle || '';
              // Debug: log current content and user to console before sending
              try { console.log('Posting: user=', username, 'content=', (content || '').slice(0,200)); } catch (e) {}

              const payload = { name, username, content, image };
              const res = await fetch('/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-username': username },
                body: JSON.stringify(payload), // send name + username per new schema
              });

              if (!res.ok) {
                const txt = await res.text().catch(() => '');
                console.error('Create post failed', res.status, txt);
                const errMessage = txt || ('Server returned ' + res.status);
                const notification = document.createElement('div');
                notification.className = 'post-notification error';
                notification.textContent = '❌ Gagal membuat posting: ' + errMessage;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 5000);
                return;
              }

              const post = await res.json();

              // compute a human friendly time right away
              const renderedTime = post.time_post ? timeAgo(post.time_post) : post.createdAt ? timeAgo(post.createdAt) : 'Baru saja';

              const feed = document.querySelector('.social-feed');
              const div = document.createElement('div');
              div.className = 'post';
              div.dataset.id = post.id;
                div.innerHTML = \`
                <div class="post-header"><strong>\${post.name}</strong><span class="handle">\${post.username}</span><span class="time">\${renderedTime}</span></div>
                <div class="post-content">\${post.content}</div>
                \${post.image ? '<img src="\${post.image}" class="post-img">' : ''}
                <div class="post-actions">
                  <button class="like-btn">🤍 \${post.likes}</button>
                  <button class="comment-btn">💬 \${post.comments}</button>
                  <button class="repost-btn">🔄 \${post.reposts}</button>
                </div>
              \`;

              try {
                const myPosts = JSON.parse(localStorage.getItem('myPosts') || '[]');
                myPosts.unshift(post.id);
                localStorage.setItem('myPosts', JSON.stringify(myPosts));
              } catch (e) {}

              if (feed) {
                feed.insertBefore(div, feed.querySelector('.post'));
                // pass the post content so the edit button stores the correct text
                addOwnerControls(div, post.id, post.content ?? '');
              }

              contentEl.value = '';
              previewContainer.style.display = 'none';
              imageInput.value = '';

              const notification = document.createElement('div');
              notification.className = 'post-notification';
              notification.textContent = '✨ Post berhasil ditambahkan!';
              document.body.appendChild(notification);
              setTimeout(() => notification.remove(), 3000);
            });
          }
        });
      </script>
    `;
    return Promise.resolve(html);
  },
});
