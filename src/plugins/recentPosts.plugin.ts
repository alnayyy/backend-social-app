import { PluginManager } from '../common/pluginManager';

PluginManager.register({
  name: 'recentPosts',
  render() {
    const posts = [
      {
        title:
          'Pengusutan Kematian Affan Kurniawan - Salah satu tuntutan 17+8 adalah pembentukan tim investigasi atas kematian pengemudi ojol Affan.',
        date: '2025-11-10',
      },
      {
        title: '#DukunganTransformasiNasional - Tagar ini muncul di X sebagai bentuk dukungan terhadap program transformasi pemerintah.',
        date: '2025-11-01',
      },
      {
        title:
          'Warna “Brave Pink” & “Hero Green” — Simbol gerakan 17+8: pink melambangkan keberanian, hijau mewakili harapan.',
        date: '2025-11-05',
      },
      {
        title:
          'Na Daehoon Resmi Gugat Cerai Julia Prastini, Usai Isu Perselingkuhan Viral',
        date: '2025-10-15',
      },
      {
        title:
          'Tasya Farasya Ajukan Gugatan Cerai dari Ahmad Assegaf, Diajukan 29 September 2025',
        date: '2025-10-10',
      },
      {
        title:
          'Sabrina Chairunnisa Gugat Cerai Deddy Corbuzier di Pengadilan Agama Jakarta Selatan',
        date: '2025-10-08',
      },
    ];

    return `
      <style>
        /* compact recent posts - let sidebar control width so it matches both themes */
        .recent-posts {
          width: 100%;
          box-sizing: border-box;
          padding: 8px 10px;
          background: transparent;
          font-size: 0.95rem;
        }

        .recent-posts h3 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          display:flex;
          align-items:center;
          gap:8px;
        }

        .recent-posts ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 8px;
        }

        .recent-posts li {
          display: block;
          padding: 6px 8px;
          border-radius: 8px;
          background: rgba(0,0,0,0.03);
          color: #333;
          line-height: 1.3;
          font-size: 0.92rem;
          /* allow wrapping so long titles remain visible */
          overflow: visible;
          white-space: normal;
          word-break: break-word;
        }

        .recent-posts li strong {
          display: block;
          font-weight: 600;
          /* ensure long words break rather than overflow */
          word-break: break-word;
        }

        .recent-posts li small {
          display: block;
          font-size: 0.78rem;
          color: #777;
          margin-top: 4px;
        }

        @media (max-width: 480px) {
          .recent-posts { max-width: 260px; padding: 6px; font-size: 0.9rem; }
          .recent-posts h3 { font-size: 0.95rem; }
          .recent-posts li { font-size: 0.88rem; }
        }
      </style>

      <div class="recent-posts">
        <h3>📰 Trending Topic</h3>
        <ul>
          ${posts
            .map(
              (p) =>
                `<li><strong title="${p.title}">${p.title}</strong><small>${p.date}</small></li>`,
            )
            .join('')}
        </ul>
      </div>
    `;
  },
});
