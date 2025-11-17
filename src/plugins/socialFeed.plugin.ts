import { PluginManager } from '../common/pluginManager';

PluginManager.register({
  name: 'socialFeed',

  render: async (): Promise<string> => {
    try {
      const response = await fetch('http://localhost:3000/posts');
      const posts = await response.json();

      // Defensive handling: some responses may wrap the array (e.g. { data: [...] })
      let postArray: any = posts;
      if (!Array.isArray(postArray)) {
        if (posts && Array.isArray(posts.data)) postArray = posts.data;
        else if (posts && Array.isArray(posts.items)) postArray = posts.items;
        else if (posts && Array.isArray(posts.rows)) postArray = posts.rows;
      }

      if (!Array.isArray(postArray)) {
        // Log unexpected payload to help debugging; return a friendly message instead of crashing
        console.error('Unexpected posts payload (expected array):', posts);
        return `<div class="empty-feed">Gagal memuat feed 😔</div>`;
      }

      if (postArray.length === 0) {
        return `<div class="empty-feed">Belum ada postingan 😅</div>`;
      }

      const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        const intervals: Record<string, number> = {
          tahun: 31536000,
          bulan: 2592000,
          minggu: 604800,
          hari: 86400,
          jam: 3600,
          menit: 60,
        };
        for (const [unit, value] of Object.entries(intervals)) {
          const amount = Math.floor(seconds / value);
          if (amount >= 1) return `${amount} ${unit} yang lalu`;
        }
        return 'Baru saja';
      };

      const items = postArray
        .map(
          (p: any) => `
          <div class="post" data-id="${p.id}">
              <div class="post-header">
              <strong>${p.name && String(p.name).trim() ? p.name : 'Anonim'}</strong>
              <span class="handle">${p.username && String(p.username).trim() ? p.username : ''}</span>
              <span class="time">${
                p.time_post
                  ? timeAgo(p.time_post)
                  : p.createdAt
                    ? timeAgo(p.createdAt)
                    : ''
              }</span>
            </div>

            <div class="post-content">${p.content ?? ''}</div>
            ${
              p.image
                ? `<img src="${p.image}" alt="post-image" class="post-image"/>`
                : ''
            }

            <div class="post-actions">
              <button class="like-btn">🤍 ${p.likes ?? 0}</button>
              <button class="comment-btn">💬 ${p.comments ?? 0}</button>
              <button class="repost-btn">🔄 ${p.reposts ?? 0}</button>
              <button class="edit-btn" data-id="${p.id}" data-content="${p.content}">✏️ Edit</button>
              <button class="delete-btn" data-id="${p.id}">🗑️ Hapus</button>
            </div>

            <!-- 💬 Komentar -->
            <div class="comment-section" style="display:none;">
              <div class="comments-list"></div>
              <div class="add-comment">
                <input type="text" placeholder="Tulis komentar..." />
                <button class="send-comment">Kirim</button>
              </div>
            </div>
          </div>`,
        )
        .join('');

      const html = `
        <style>
          .social-feed {
            max-width: 100%;
            box-sizing: border-box;
            /* Make the feed column scroll independently so only the left column scrolls */
            max-height: calc(100vh - 160px);
            overflow-y: auto;
            padding-right: 8px;
          }

          /* sidebar sticky handled in global theme CSS (home.css / homeDark.css) */
          .post-actions button {
            margin-right: 6px;
            border: none;
            background: none;
            border-radius: 6px;
            padding: 4px 8px;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .post-actions button:hover {
            background:none;
          }

          /* 🎨 Komentar */
          .comment-section {
            margin-top: 10px;
            border-top: 1px solid #eee;
            padding-top: 8px;
          }
          .comments-list .comment,
          .comments-list .reply {
            background: none;
            border-radius: 8px;
            padding: 6px 8px;
            margin-bottom: 6px;
          }
          .comment .reply-toggle {
            border: none;
            background: none;
            color: #007bff;
            cursor: pointer;
            font-size: 12px;
          }
          .reply-input {
            display: none;
            margin-top: 4px;
            gap: 4px;
          }
          .reply-input input {
            flex: 1;
            border-radius: 6px;
            border: 1px solid #ccc;
            padding: 4px 6px;
          }
          .reply-input button {
            border: none;
            background: #007bff;
            color: #fff;
            padding: 4px 8px;
            border-radius: 6px;
            cursor: pointer;
          }
          .add-comment {
            display: flex;
            gap: 4px;
            margin-top: 6px;
          }
          .add-comment input {
            flex: 1;
            border-radius: 6px;
            border: 1px solid #ccc;
            padding: 4px 6px;
          }
          .add-comment button {
            border: none;
            background: #28a745;
            color: #fff;
            padding: 4px 8px;
            border-radius: 6px;
            cursor: pointer;
          }

          /* Modal */
          .modal { display:none; position:fixed; z-index:1000; left:0; top:0; width:100%; height:100%; background-color:rgba(0,0,0,0.4); justify-content:center; align-items:center; }
          .modal-content { background-color:#fff; padding:20px; border-radius:12px; width:300px; text-align:center; box-shadow:0 5px 20px rgba(0,0,0,0.3); animation:fadeIn 0.3s ease; }
          @keyframes fadeIn { from{opacity:0; transform:scale(0.95);} to{opacity:1; transform:scale(1);} }
          .modal-buttons { margin-top:12px; display:flex; justify-content:space-around; }
          .btn { padding:6px 12px; border:none; border-radius:8px; cursor:pointer; }
          .btn-confirm { background:#28a745; color:white; }
          .btn-cancel { background:#dc3545; color:white; }
        </style>

        <div class="social-feed">
          <h3>🔥 For You</h3>
          ${items}
        </div>

        <!-- Modal Edit -->
        <div id="editModal" class="modal">
          <div class="modal-content">
            <h4>✏️ Edit Postingan</h4>
            <textarea id="editContent"></textarea>
            <div class="modal-buttons">
              <button class="btn btn-confirm" id="saveEdit">Simpan</button>
              <button class="btn btn-cancel" id="cancelEdit">Batal</button>
            </div>
          </div>
        </div>

        <!-- Modal Delete -->
        <div id="deleteModal" class="modal">
          <div class="modal-content">
            <h4>🗑️ Hapus Postingan?</h4>
            <p>Apakah kamu yakin ingin menghapus postingan ini?</p>
            <div class="modal-buttons">
              <button class="btn btn-confirm" id="confirmDelete">Ya, Hapus</button>
              <button class="btn btn-cancel" id="cancelDelete">Batal</button>
            </div>
          </div>
        </div>

        <script>
          let currentEditId = null;
          let currentDeleteId = null;

          // ==================== POST EDIT / DELETE ====================
          document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('edit-btn')) {
              currentEditId = target.dataset.id;
              document.getElementById('editContent').value = target.dataset.content;
              document.getElementById('editModal').style.display = 'flex';
            }
            if (target.classList.contains('delete-btn')) {
              currentDeleteId = target.dataset.id;
              document.getElementById('deleteModal').style.display = 'flex';
            }
          });

          document.getElementById('cancelEdit').onclick = () =>
            (document.getElementById('editModal').style.display = 'none');
          document.getElementById('cancelDelete').onclick = () =>
            (document.getElementById('deleteModal').style.display = 'none');

          document.getElementById('saveEdit').onclick = async () => {
            const newContent = document.getElementById('editContent').value.trim();
            if (!newContent) return alert('Isi tidak boleh kosong!');
            const res = await fetch('/posts/' + currentEditId, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: newContent }),
            });
            if (res.ok) { location.reload(); } else alert('❌ Gagal update.');
          };
          document.getElementById('confirmDelete').onclick = async () => {
            const res = await fetch('/posts/' + currentDeleteId, { method: 'DELETE' });
            if (res.ok) { location.reload(); } else alert('❌ Gagal hapus.');
          };
          window.onclick = (e) => {
            if (e.target.classList.contains('modal')) e.target.style.display = 'none';
          };

          // ==================== KOMENTAR INTERAKTIF ====================
          document.addEventListener('click', (e) => {
            // toggle komentar
            const btn = e.target.closest('.comment-btn');
            if (btn) {
              const post = btn.closest('.post');
              const section = post.querySelector('.comment-section');
              section.style.display = section.style.display === 'none' ? 'block' : 'none';
            }

            // kirim komentar baru
            if (e.target.closest('.send-comment')) {
              const post = e.target.closest('.post');
              const input = post.querySelector('.add-comment input');
              const list = post.querySelector('.comments-list');
              const text = input.value.trim();
              if (!text) return;
              const newComment = document.createElement('div');
              newComment.className = 'comment';
              newComment.innerHTML = \`
                <strong>Kamu</strong>: \${text}
                <span class="comment-time">baru saja</span>
                <button class="reply-toggle">Balas</button>
                <div class="replies"></div>
                <div class="reply-input" style="display:none;">
                  <input type="text" placeholder="Balas komentar..." />
                  <button class="send-reply">Kirim</button>
                </div>\`;
              list.appendChild(newComment);
              input.value = '';
            }

            // toggle balasan
            if (e.target.classList.contains('reply-toggle')) {
              const parent = e.target.closest('.comment');
              const replyInput = parent.querySelector('.reply-input');
              replyInput.style.display = replyInput.style.display === 'none' ? 'flex' : 'none';
            }

            // kirim balasan
            if (e.target.classList.contains('send-reply')) {
              const replyInput = e.target.closest('.reply-input');
              const input = replyInput.querySelector('input');
              const text = input.value.trim();
              if (!text) return;
              const repliesContainer = replyInput.parentElement.querySelector('.replies');
              const newReply = document.createElement('div');
              newReply.className = 'reply';
              newReply.innerHTML = \`
                <strong>Kamu</strong>: \${text}
                <span class="comment-time">baru saja</span>\`;
              repliesContainer.appendChild(newReply);
              input.value = '';
              replyInput.style.display = 'none';
            }
          });
        </script>
      `;

      return html;
    } catch (error) {
      console.error('❌ Gagal mengambil feed:', error);
      return `<div class="empty-feed">Gagal memuat feed 😔</div>`;
    }
  },
});
