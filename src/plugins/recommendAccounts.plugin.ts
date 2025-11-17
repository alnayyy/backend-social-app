import { PluginManager } from '../common/pluginManager';

PluginManager.register({
  name: 'recommendAccounts',
  render() {
    const accounts = [
      {
        id: 1,
        name: 'OpenAI',
        username: '@OpenAI',
        followers: 1200,
        photo: '/uploads/openai.jpg',
      },
      {
        id: 2,
        name: 'NASA',
        username: '@nasa',
        followers: 980,
        photo: '/uploads/nasa.jpg',
      },
      {
        id: 3,
        name: 'Taylor Swift',
        username: '@taylorswift13',
        followers: 890,
        photo: '/uploads/taylor.jpg',
      },
      {
        id: 4,
        name: 'Elon Musk',
        username: '@elonmusk',
        followers: 1500,
        photo: '/uploads/elon.jpg',
      },
      {
        id: 5,
        name: 'Ariana Grande',
        username: '@arianagrande',
        followers: 1320,
        photo: '/uploads/ariana.jpg',
      },
    ];

    return `
      <style>
        .recommend-section {
          max-width: 100%;
          padding: 10px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          /* allow horizontal scrolling for the inner carousel */
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
          transition: background 0.3s, color 0.3s;
          position: relative;
        }

        .recommend-carousel {
          display: flex;
          flex-direction: row;
          gap: 12px;
          min-width: max-content;
          align-items: center;
          padding-bottom: 6px; /* space for scrollbar */
        }

        .recommend-card {
          flex: 0 0 auto;
          width: 120px;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .profile-photo {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #fbc4c4;
          margin-bottom: 5px;
        }

        .recommend-info strong {
          font-size: 13px;
        }

        .recommend-info small {
          display: block;
          font-size: 11px;
          opacity: 0.8;
        }

        .followers-count {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 2px;
        }

        .follow-btn {
          border: none;
          padding: 3px 8px;
          font-size: 11px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 4px;
          transition: all 0.2s;
        }

        /* hide native scrollbar but keep scrolling functionality */
        .recommend-section::-webkit-scrollbar {
          display: none;
          height: 0;
        }
      </style>

      <div class="plugin recommend-section">
        <h3>✨ Recommended Account</h3>
        <div class="recommend-carousel">
          ${accounts
            .map(
              (acc) => `
            <div class="recommend-card" data-id="${acc.id}">
              <img src="${acc.photo}" alt="${acc.name}" class="profile-photo" />
              <div class="recommend-info">
                <strong>${acc.name}</strong>
                <small>${acc.username}</small>
                <div class="followers-count">${acc.followers} pengikut</div>
                <button class="follow-btn">Ikuti</button>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          document.querySelectorAll('.recommend-card').forEach((card) => {
            const btn = card.querySelector('.follow-btn');
            const countEl = card.querySelector('.followers-count');
            let followed = false;

            btn.addEventListener('click', () => {
              let count = parseInt(countEl.textContent);
              if (!followed) {
                count++;
                btn.textContent = 'Mengikuti';
                btn.classList.add('following');
                followed = true;
              } else {
                count--;
                btn.textContent = 'Ikuti';
                btn.classList.remove('following');
                followed = false;
              }
              countEl.textContent = count + ' pengikut';
            });
          });
        });
      </script>
    `;
  },
});
