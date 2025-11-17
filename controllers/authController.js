// Single, cleaned legacy auth controller.
/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require('bcrypt');

// NOTE: in-memory fallback removed — database persistence is required.

let AppDataSource;
let AuthUserEntity;
try {
  AppDataSource = require('../dist/src/database/data-source').AppDataSource;
  AuthUserEntity = require('../dist/src/auth/auth-user.entity').AuthUser;
} catch (err) {
  void err;
  AppDataSource = null;
  AuthUserEntity = null;
}

let isDataSourceInit = false;
async function getAuthRepo() {
  if (!AppDataSource || !AuthUserEntity) {
    console.warn('⚠ AppDataSource atau AuthUserEntity tidak ditemukan');
    return null;
  }
  try {
    if (!AppDataSource.isInitialized && !isDataSourceInit) {
      await AppDataSource.initialize();
      isDataSourceInit = true;
      console.log('✅ AppDataSource initialized (from authController)');
    }
    return AppDataSource.getRepository(AuthUserEntity);
  } catch (err) {
    console.error('❌ Gagal initialize AppDataSource:', err.message);
    return null;
  }
}

exports.showLogin = (req, res) => {
  if (req.session && req.session.user) return res.redirect('/');
  return res.render('layouts/authLayout', {
    page: 'login',
    layout: false,
    title: 'Login',
  });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).render('layouts/authLayout', {
      page: 'login',
      layout: false,
      title: 'Login',
      error: 'Username dan password harus diisi',
      username: username || '',
    });
  }
  let user = null;
  const repo = await getAuthRepo();
  if (repo) {
    try {
      const entity = await repo.findOne({ where: { username } });
      if (entity)
        user = {
          username: entity.username,
          passwordHash: entity.passwordHash || entity.password,
        };
    } catch (err) {
      void err;
    }
  }
  if (!user) {
    if (repo) {
      return res.status(404).render('layouts/authLayout', {
        page: 'login',
        layout: false,
        title: 'Login',
        error: 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.',
        username,
      });
    }
    return res.status(500).render('layouts/authLayout', {
      page: 'login',
      layout: false,
      title: 'Login',
      error: 'Database tidak tersedia. Hubungi administrator.',
      username,
    });
  }
  const match = bcrypt.compareSync(password, user.passwordHash);
  if (match) {
    if (req.session) req.session.user = username;
    return res.redirect('/');
  }
  return res.status(401).render('layouts/authLayout', {
    page: 'login',
    layout: false,
    title: 'Login',
    error: 'Username atau password salah',
    username,
  });
};

exports.showRegister = (req, res) => {
  if (req.session && req.session.user) return res.redirect('/');
  return res.render('layouts/authLayout', {
    page: 'register',
    layout: false,
    title: 'Register',
  });
};

exports.postRegister = async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !password)
    return res.status(400).render('layouts/authLayout', {
      page: 'register',
      layout: false,
      title: 'Register',
      error: 'Username dan password harus diisi',
      username: username || '',
      email: email || '',
    });
  const passwordHash = bcrypt.hashSync(password, 10);
  const repo = await getAuthRepo();
  if (!repo)
    return res.status(500).render('layouts/authLayout', {
      page: 'register',
      layout: false,
      title: 'Register',
      error:
        'Database tidak tersedia. Pendaftaran sementara tidak bisa dilakukan.',
      username: username || '',
      email: email || '',
    });
  try {
    const existing = await repo.findOne({ where: { username } });
    if (existing)
      return res.status(409).render('layouts/authLayout', {
        page: 'register',
        layout: false,
        title: 'Register',
        error: 'Username sudah terpakai',
        username,
        email,
      });
    await repo.save(
      repo.create({
        username,
        email: email || null,
        passwordHash,
        displayName: '',
        profilePhoto: '',
      }),
    );
    return res.redirect('/login');
  } catch (err) {
    console.error('Register error:', err && err.message ? err.message : err);
    return res.status(500).render('layouts/authLayout', {
      page: 'register',
      layout: false,
      title: 'Register',
      error: 'Terjadi kesalahan pada server saat mendaftar. Coba lagi nanti.',
      username: username || '',
      email: email || '',
    });
  }
};

exports.logout = (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      try {
        res.clearCookie('connect.sid');
      } catch (err) {
        void err;
      }
      return res.redirect('/login');
    });
  } else return res.redirect('/login');
};

exports.showProfile = async (req, res) => {
  const username = req.session && req.session.user;
  if (!username) return res.redirect('/login');
  let user = null;
  const repo = await getAuthRepo();
  if (!repo)
    return res.status(500).render('layouts/authLayout', {
      page: 'login',
      layout: false,
      title: 'Login',
      error: 'Database tidak tersedia. Hubungi administrator.',
    });
  try {
    const entity = await repo.findOne({ where: { username } });
    if (entity)
      user = {
        username: entity.username,
        displayName: entity.displayName || '',
        profilePhoto: entity.profilePhoto || '',
        bio: entity.bio || '',
        location: entity.location || '',
        followersCount: entity.followersCount || 0,
        followingCount: entity.followingCount || 0,
      };
  } catch (err) {
    console.error(
      'Profile load error:',
      err && err.message ? err.message : err,
    );
    return res.status(500).render('users/profile', {
      title: 'Error',
      user: null,
      sidebarContent: '',
      navSidebarContent: '',
      layout: 'layout',
      error: 'Gagal memuat profil pengguna.',
    });
  }
  if (!user)
    return res.status(404).render('users/profile', {
      title: 'Profile',
      user: null,
      sidebarContent: '',
      navSidebarContent: '',
      layout: 'layout',
      error: 'Pengguna tidak ditemukan.',
    });
  let sidebarContent = '';
  let navSidebarContent = '';
  try {
    const AreaManager = (global && global.AreaManager) || null;
    if (AreaManager && typeof AreaManager.renderArea === 'function') {
      sidebarContent = await AreaManager.renderArea('sidebar');
      navSidebarContent = await AreaManager.renderArea('nav-sidebar');
    }
  } catch (err) {
    void err;
  }
  return res.render('users/profile', {
    title: `${user.displayName || user.username} - Profile`,
    user,
    sidebarContent,
    navSidebarContent,
    layout: 'layout',
  });
};

exports.postProfile = async (req, res) => {
  const username = req.session && req.session.user;
  if (!username) return res.redirect('/login');
  const { displayName } = req.body || {};
  let profilePhotoPath = null;
  if (req.file && req.file.path) {
    const publicPath = req.file.path.replace(/\\/g, '/');
    const idx = publicPath.indexOf('/public/');
    profilePhotoPath =
      idx > -1
        ? publicPath.substring(idx + '/public'.length)
        : '/' + publicPath;
  }
  const repo = await getAuthRepo();
  if (repo) {
    try {
      const entity = await repo.findOne({ where: { username } });
      if (!entity) return res.redirect('/login');
      const { username: newUsername, bio, location } = req.body || {};
      if (newUsername && newUsername !== username) {
        const existing = await repo.findOne({
          where: { username: newUsername },
        });
        if (existing) {
          return res.status(409).render('layouts/authLayout', {
            page: 'profile',
            layout: false,
            title: 'Profile',
            error: 'Username sudah terpakai',
          });
        }
        entity.username = newUsername;
        if (req.session) req.session.user = newUsername;
      }
      if (displayName !== undefined) entity.displayName = displayName;
      if (bio !== undefined) entity.bio = bio;
      if (location !== undefined) entity.location = location;
      if (profilePhotoPath) entity.profilePhoto = profilePhotoPath;
      await repo.save(entity);
      return res.redirect('/profile');
    } catch (err) {
      void err;
    }
  }
  const user = users.get(username);
  if (user) {
    if (displayName !== undefined) user.displayName = displayName;
    if (profilePhotoPath) user.profilePhoto = profilePhotoPath;
    users.set(username, user);
  }
  return res.redirect('/profile');
};

// AJAX endpoint to check username availability
exports.checkUsername = async (req, res) => {
  const username = (req.query && req.query.username) || '';
  if (!username) return res.status(400).json({ error: 'username required' });
  const repo = await getAuthRepo();
  if (!repo) return res.status(500).json({ error: 'database unavailable' });
  try {
    const existing = await repo.findOne({ where: { username } });
    // allow if existing is the same as current session user
    const current = req.session && req.session.user;
    if (existing && existing.username !== current)
      return res.json({ available: false });
    return res.json({ available: true });
  } catch (err) {
    console.error(
      'checkUsername error:',
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ error: 'internal' });
  }
};
