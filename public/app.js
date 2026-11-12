/*
 * Status 200 Ticketing Platform: front-end script (vanilla JS, no build step)
 *
 * Card #8: login & registration (public/index.html)
 *   - POST /api/auth/register  { name, email, password }
 *   - POST /api/auth/login     { email, password }
 *   Both return { _id, name, email, role, token }. The JWT is saved in
 *   localStorage and the user is redirected to dashboard.html.
 *
 * Shared helpers for other pages (e.g. the ticket dashboard, card #9):
 *   window.Status200.Auth.getToken()   -> stored JWT or null
 *   window.Status200.api(path, opts)   -> fetch wrapper that sends
 *                                         "Authorization: Bearer <token>"
 */
;(() => {
  'use strict'

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  const API_BASE = '' // same origin: server.js serves /public and /api together
  const TOKEN_KEY = 'token' // localStorage key for the JWT
  const USER_KEY = 'user' // localStorage key for { _id, name, email, role }
  const AFTER_LOGIN = 'dashboard.html'

  // ---------------------------------------------------------------------------
  // Token storage
  // ---------------------------------------------------------------------------
  const Auth = {
    getToken() {
      return localStorage.getItem(TOKEN_KEY)
    },
    getUser() {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
      } catch {
        return null
      }
    },
    /** Saves the body returned by /api/auth/login or /api/auth/register */
    save({ token, ...user }) {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },
    /** Sign-out: JWTs are stateless, so discarding the token ends the session */
    clear() {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
    /** True when a token is stored and its "exp" claim has not passed */
    isSignedIn() {
      const token = this.getToken()
      if (!token) return false
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        return typeof payload.exp !== 'number' || payload.exp * 1000 > Date.now()
      } catch {
        return false
      }
    },
  }

  // ---------------------------------------------------------------------------
  // fetch wrapper
  // ---------------------------------------------------------------------------
  async function api(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    const token = auth ? Auth.getToken() : null
    if (token) headers.Authorization = `Bearer ${token}`

    let res
    try {
      res = await fetch(API_BASE + path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    } catch {
      throw new Error('Cannot reach the server. Is the backend running?')
    }

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      const error = new Error(data?.message || `Request failed (${res.status})`)
      error.status = res.status
      throw error
    }
    return data
  }

  // ---------------------------------------------------------------------------
  // Form helpers
  // ---------------------------------------------------------------------------
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const field = (form, name) => form.elements.namedItem(name)

  function setFieldError(form, name, message) {
    field(form, name)?.setAttribute('aria-invalid', message ? 'true' : 'false')
    const slot = form.querySelector(`[data-error-for="${name}"]`)
    if (slot) slot.textContent = message || ''
  }

  function clearErrors(form) {
    form.querySelectorAll('[data-error-for]').forEach((slot) => setFieldError(form, slot.dataset.errorFor, ''))
  }

  /** Shows errors; returns true when there are none */
  function applyErrors(form, errors) {
    Object.entries(errors).forEach(([name, message]) => setFieldError(form, name, message))
    const first = Object.keys(errors)[0]
    if (first) field(form, first)?.focus()
    return !first
  }

  function showAlert(box, type, message) {
    box.replaceChildren()
    box.hidden = !message
    if (!message) return
    box.className = `alert alert-${type}`
    const close = document.createElement('button')
    close.type = 'button'
    close.className = 'alert-close'
    close.setAttribute('aria-label', 'Dismiss')
    close.textContent = '×'
    close.addEventListener('click', () => showAlert(box))
    const text = document.createElement('span')
    text.textContent = message
    box.append(text, close)
  }

  function setBusy(button, busy, label) {
    if (busy) {
      button.dataset.label = button.textContent
      button.textContent = label
    } else if (button.dataset.label) {
      button.textContent = button.dataset.label
    }
    button.disabled = busy
  }

  // ---------------------------------------------------------------------------
  // Page: index.html (login + registration)
  // ---------------------------------------------------------------------------
  function initAuthPage() {
    const loginForm = document.getElementById('login-form')
    const registerForm = document.getElementById('register-form')
    const alertBox = document.getElementById('form-alert')
    const tabs = { login: document.getElementById('tab-login'), register: document.getElementById('tab-register') }

    // Already signed in: offer the dashboard or sign-out instead of the forms
    if (Auth.isSignedIn()) {
      const user = Auth.getUser() || {}
      document.getElementById('signed-in-name').textContent = user.name || 'user'
      document.getElementById('signed-in-email').textContent = user.email || ''
      document.getElementById('signed-in').hidden = false
      document.getElementById('auth-forms').hidden = true
      document.getElementById('sign-out').addEventListener('click', () => {
        Auth.clear()
        window.location.replace('index.html')
      })
      return
    }
    Auth.clear() // drop any expired token

    function showTab(name) {
      const isLogin = name === 'login'
      loginForm.hidden = !isLogin
      registerForm.hidden = isLogin
      tabs.login.setAttribute('aria-selected', String(isLogin))
      tabs.register.setAttribute('aria-selected', String(!isLogin))
      showAlert(alertBox)
      history.replaceState(null, '', isLogin ? '#login' : '#register')
    }
    tabs.login.addEventListener('click', () => showTab('login'))
    tabs.register.addEventListener('click', () => showTab('register'))
    const tabFromHash = () => showTab(window.location.hash === '#register' ? 'register' : 'login')
    window.addEventListener('hashchange', tabFromHash) // e.g. a link to index.html#register
    tabFromHash()

    async function submit(form, path, body, busyLabel) {
      const button = form.querySelector('button[type="submit"]')
      setBusy(button, true, busyLabel)
      try {
        const data = await api(path, { method: 'POST', body, auth: false })
        Auth.save(data) // persist JWT + profile in localStorage
        window.location.assign(AFTER_LOGIN)
      } catch (err) {
        showAlert(alertBox, 'error', err.message)
        setBusy(button, false)
      }
    }

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault()
      clearErrors(loginForm)
      showAlert(alertBox)
      const email = field(loginForm, 'email').value.trim()
      const password = field(loginForm, 'password').value
      const errors = {}
      if (!email) errors.email = 'Email is required'
      else if (!EMAIL.test(email)) errors.email = 'Enter a valid email address'
      if (!password) errors.password = 'Password is required'
      if (applyErrors(loginForm, errors)) submit(loginForm, '/api/auth/login', { email, password }, 'Signing in…')
    })

    registerForm.addEventListener('submit', (event) => {
      event.preventDefault()
      clearErrors(registerForm)
      showAlert(alertBox)
      const name = field(registerForm, 'name').value.trim()
      const email = field(registerForm, 'email').value.trim()
      const password = field(registerForm, 'password').value
      const confirm = field(registerForm, 'confirm').value
      const errors = {}
      if (!name) errors.name = 'Name is required'
      if (!email) errors.email = 'Email is required'
      else if (!EMAIL.test(email)) errors.email = 'Enter a valid email address'
      if (password.length < 8) errors.password = 'Password must be at least 8 characters'
      if (confirm !== password) errors.confirm = 'Passwords do not match'
      if (applyErrors(registerForm, errors)) {
        submit(registerForm, '/api/auth/register', { name, email, password }, 'Creating account…')
      }
    })
  }

  // ---------------------------------------------------------------------------
  // Exports for other pages + boot
  // ---------------------------------------------------------------------------
  window.Status200 = { Auth, api }

  const pages = { auth: initAuthPage }
  document.addEventListener('DOMContentLoaded', () => pages[document.body.dataset.page]?.())
})()
