import {FarmSync} from './farm-sync.js';

const PROJECT = 'https://jtpyocygkyjvljfejuyo.supabase.co';
const PUBLIC_KEY = 'sb_publishable_pvvvem6qrBOBa5iNKWgjhA_BJLlou_E';
const AUTH_KEY = 'rostok-auth-v1';
const cacheKey = id => 'rostok-farm-account-v1:' + id;
const el = id => document.getElementById(id);

function sdk() {
  if (window.supabase) return Promise.resolve(window.supabase);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('./vendor/supabase-2.118.0.js', import.meta.url);
    script.onload = () => resolve(window.supabase);
    script.onerror = () => { script.remove(); reject(new Error('Не удалось загрузить вход. Проверь интернет.')); };
    document.head.append(script);
  });
}

export function connectAccount(game) {
  let client, opening, sessionUser, sync, timer, release, epoch = 0, email = '';
  let mode = 'guest', lastState = '', busy = false, cacheOK = true;
  const dialog = el('accountDialog');
  const message = text => { el('accountMessage').textContent = text; };
  const setBusy = value => {
    busy = value;
    dialog.querySelectorAll('button:not(.close-dialog)').forEach(b => { b.disabled = value; });
  };
  function badge(title, detail) {
    const small = document.createElement('small');
    small.textContent = detail;
    el('saveStatus').replaceChildren(title, small);
  }
  function form() {
    const signed = Boolean(sessionUser);
    el('accountButton').textContent = signed ? 'Моя ферма' : 'Войти';
    el('accountIntro').hidden = signed;
    el('emailForm').hidden = signed || Boolean(email);
    el('otpForm').hidden = signed || !email;
    el('accountIdentity').textContent = sessionUser?.email || '';
    el('accountIdentity').hidden = !signed;
    el('syncNow').hidden = !signed || lastState === 'conflict';
    el('logout').hidden = !signed;
    el('backToFarm').hidden = !signed;
    el('conflictChoices').hidden = lastState !== 'conflict';
  }
  function status(state) {
    lastState = state;
    const labels = {
      loading: ['Открываем ферму', 'из аккаунта'],
      synced: ['Прогресс сохранён', 'в аккаунте'],
      queued: ['Сохраняем…', 'в аккаунте'],
      offline: ['Облако недоступно', sync?.cache && cacheOK ? 'копия на устройстве' : 'повтори подключение'],
      conflict: ['Выбери версию', 'в меню «Моя ферма»'],
      locked: ['Ферма в другой вкладке', 'закрой её и нажми «Синхронизировать»'],
    };
    badge(...labels[state]);
    const notes = {
      loading: 'Загружаем сохранение…', synced: 'Ферма и код сохранены в аккаунте.',
      queued: 'Отправляем изменения…', offline: 'Не удалось связаться с облаком. Повтори синхронизацию, когда появится связь.',
      locked: 'Эта ферма открыта в другой вкладке браузера. Закрой ту вкладку и нажми «Синхронизировать».',
      conflict: 'Сохранения разошлись.',
    };
    message(notes[state]);
    if (state === 'queued') schedule();
    if (state === 'conflict') {
      game.pause();
      const describe = data => (data?.farm?.harvests || 0) + ' ур., ' + (data?.farm?.coins || 0) + ' мон.';
      el('conflictSummary').textContent = 'На устройстве: ' + describe(sync.cache.snapshot) + '. В облаке: ' + describe(sync.conflict.row?.snapshot) + '.';
      if (!dialog.open) dialog.showModal();
    }
    game.lock(state === 'locked' || state === 'conflict' || !sync?.cache);
    form();
  }
  function schedule() {
    if (timer || !sync || sync.conflict) return;
    timer = setTimeout(() => { timer = null; sync?.run(); }, 1400);
  }
  async function init() {
    if (client) return client;
    if (!opening) opening = sdk().then(lib => {
      client = lib.createClient(PROJECT, PUBLIC_KEY, {auth: {
        storageKey: AUTH_KEY, detectSessionInUrl: false, flowType: 'pkce',
      }});
      client.auth.onAuthStateChange((_event, session) => {
        // The SDK holds its auth lock while notifying listeners.
        setTimeout(() => switchUser(session?.user ?? null), 0);
      });
      return client;
    }).catch(error => { opening = null; throw error; });
    return opening;
  }
  function detach() {
    clearTimeout(timer); timer = null;
    release?.(); release = null;
    sync = null; lastState = ''; cacheOK = true;
  }
  async function switchUser(user, force = false) {
    if (!force && user?.id === sessionUser?.id && mode !== 'starting') return;
    const seed = mode === 'guest' ? game.snapshot() : game.guest();
    const ticket = ++epoch;
    detach();
    sessionUser = user;
    email = '';
    game.pause();
    if (!user) {
      mode = 'guest';
      game.restore(game.guest());
      game.lock(false); form(); message('');
      badge('Личная ферма', 'в этом браузере');
      return;
    }
    mode = 'account';
    game.restore(null);
    status('loading');
    const key = cacheKey(user.id);
    if (navigator.locks) {
      let acquired;
      const result = new Promise(resolve => { acquired = resolve; });
      navigator.locks.request(key, {ifAvailable: true}, lock => {
        if (!lock || ticket !== epoch) { acquired(false); return; }
        return new Promise(resolve => { release = resolve; acquired(true); });
      }).catch(() => acquired(false));
      if (!await result) { if (ticket === epoch) status('locked'); return; }
    }
    if (ticket !== epoch) return;
    let cache;
    try { cache = JSON.parse(localStorage.getItem(key)); } catch { cacheOK = false; }
    const table = () => client.from('rostok_farms');
    sync = new FarmSync({
      active: () => ticket === epoch,
      seed: () => seed || game.fresh(),
      cache,
      persist(record) {
        try { localStorage.setItem(key, JSON.stringify(record)); cacheOK = true; }
        catch { cacheOK = false; }
      },
      restore: game.restore,
      status,
      async read() {
        const {data, error} = await table().select('revision,snapshot').eq('user_id', user.id).maybeSingle();
        if (error) throw error;
        return data;
      },
      async write(base, id, snapshot) {
        if (ticket !== epoch) return false;
        const values = {revision: id, snapshot};
        const query = base ? table().update(values).eq('user_id', user.id).eq('revision', base)
          : table().insert({...values, user_id: user.id});
        const {data, error} = await query.select('revision').maybeSingle();
        if (error?.code === '23505') return false;
        if (error) throw error;
        return data?.revision === id;
      },
    });
    if (cache) { game.restore(cache.snapshot); game.lock(false); }
    await sync.run();
  }
  function refresh() {
    if (mode === 'account' && !sync && sessionUser) return switchUser(sessionUser, true);
    if (sync && !sync.conflict) return sync.run();
  }
  function authError(error) {
    if (error.status === 429) return 'Слишком много попыток. Подожди минуту и попробуй снова.';
    if (error.code === 'otp_expired') return 'Код неверный или истёк. Запроси новый код.';
    return 'Вход не удался. Проверь соединение, почту и код, затем попробуй снова.';
  }
  function submit(id, action) {
    el(id).onsubmit = async event => {
      event.preventDefault();
      if (busy) return;
      setBusy(true);
      try { const auth = (await init()).auth; await action(auth); }
      catch (error) { message(authError(error)); }
      finally { setBusy(false); }
    };
  }
  submit('emailForm', async auth => {
    const address = el('accountEmail').value.trim();
    message('Отправляем код…');
    const {error} = await auth.signInWithOtp({email: address});
    if (error) throw error;
    email = address; form(); el('accountOtp').value = ''; el('accountOtp').focus();
    message('Введи код из письма на ' + address + '.');
  });
  submit('otpForm', async auth => {
    message('Проверяем код…');
    const {error, data} = await auth.verifyOtp({email, token: el('accountOtp').value.trim(), type: 'email'});
    if (error) throw error;
    el('accountOtp').value = '';
    await switchUser(data.user);
  });
  el('changeEmail').onclick = () => { email = ''; form(); message(''); el('accountEmail').focus(); };
  el('accountButton').onclick = () => { form(); if (!dialog.open) dialog.showModal(); };
  el('backToFarm').onclick = () => dialog.close();
  el('syncNow').onclick = refresh;
  el('chooseDevice').onclick = () => sync?.resolve(true);
  el('chooseCloud').onclick = () => sync?.resolve(false);
  el('logout').onclick = async () => {
    if (busy) return;
    game.pause(); game.lock(true); setBusy(true);
    try {
      if (sync?.dirty) await sync.run();
      if (sync?.dirty) { message('Сначала сохрани изменения в облаке или выбери версию фермы.'); return; }
      const {error} = await client.auth.signOut({scope: 'local'});
      if (error) throw error;
      await switchUser(null);
      el('accountEmail').value = ''; dialog.close();
    } catch { message('Не удалось выйти. Попробуй ещё раз.'); }
    finally { setBusy(false); game.lock(mode !== 'guest' && (!sync?.cache || Boolean(sync.conflict))); }
  };
  window.addEventListener('online', refresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (sync?.dirty && !sync.conflict) sync.run(); }
    else refresh();
  });
  setInterval(() => { if (!document.hidden && sync && !sync.conflict) sync.run(); }, 30000);
  try {
    if (localStorage.getItem(AUTH_KEY)) {
      mode = 'starting'; game.lock(true); status('loading');
      init().catch(() => { mode = 'guest'; game.lock(false); badge('Вход недоступен', 'открыта гостевая ферма'); });
    }
  } catch { /* Guest mode works without browser storage. */ }
  return {
    isGuest: () => mode === 'guest',
    edit(snapshot) {
      if (!sync?.cache || sync.conflict) return;
      sync.edit(snapshot);
      if (lastState !== 'queued') status('queued');
      else schedule();
    },
  };
}
