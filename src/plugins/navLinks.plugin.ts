import { PluginManager } from '../common/pluginManager';

PluginManager.register({
  name: 'navLinks',
  render() {
    return `
      <style>
        .drawer-section { font-size: 0.75rem; letter-spacing: .08em; color: #7a7a7a; margin: 1rem 0 .5rem; text-transform: uppercase; }
        .drawer-menu { list-style: none; padding: 0; margin: 0; }
        .drawer-item { display: block; color: inherit; text-decoration: none; padding: .6rem .75rem; border-radius: 8px; margin: .15rem 0; }
  .drawer-item:hover { background: rgba(0,0,0,.04); }
  .drawer-sub { padding-left: 1rem; margin: .25rem 0 .35rem; border-left: 2px solid rgba(0,0,0,.06); }
        .drawer-sub .drawer-item { padding: .5rem .75rem; }
        .drawer-toggle { display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .drawer-bottom { position: sticky; bottom: 0; background: inherit; padding: .75rem; border-top: 1px solid rgba(0,0,0,.08); margin-top: 1rem; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        .theme-switch { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
      </style>
      <div class="nav-widget">
          <ul class="drawer-menu">
            <!-- Dashboard di bawah MAIN tetap ada -->
            <li><a class="drawer-item" href="/">Dashboard</a></li>
            <li><a class="drawer-item" href="/search">Search</a></li>
            <li><a class="drawer-item" href="/messages">Messages</a></li>
            <li><a class="drawer-item" href="/notifications">Notifications</a></li>
            <li><a class="drawer-item" href="/profile">Profile</a></li>
          </ul>

        <ul class="drawer-menu">
          <li>
            <div class="drawer-item drawer-toggle" onclick="this.nextElementSibling.hidden = !this.nextElementSibling.hidden;">More <span>▾</span></div>
            <div class="drawer-sub" hidden>
              <a class="drawer-item" href="/settings">Setting</a>
              <a class="drawer-item" href="/switch-account">Ganti Akun</a>
              <a class="drawer-item" href="/logout">Keluar Akun</a>
            </div>
          </li>
        </ul>

        <div class="drawer-bottom">
          <div class="theme-switch" role="group" aria-label="Theme">
            <a class="theme-btn" href="/theme/light">Light</a>
            <a class="theme-btn" href="/theme/dark">Dark</a>
          </div>
        </div>
      </div>
    `;
  },
});
