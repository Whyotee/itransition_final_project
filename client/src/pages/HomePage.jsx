export default function HomePage({ user, onLogout }) {
  return (
    <div>
      <h1>CV City</h1>

      {user ? (
        <div className="d-flex align-items-center gap-2 mt-3">
          {user.avatarUrl && (
            <img src={user.avatarUrl} alt="" width="40" height="40" className="rounded-circle" />
          )}
          <span>
            Signed in as <strong>{user.name}</strong>{" "}
            <span className="badge bg-primary">{user.role}</span>
          </span>
          <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
            Log out
          </button>
        </div>
      ) : (
        
        <div className="d-flex gap-2 mt-3">
          <a className="btn btn-dark" href="/api/auth/github">
            Login with GitHub
          </a>
          <a className="btn btn-danger" href="/api/auth/google">
            Login with Google
          </a>
        </div>
      )}
    </div>
  );
}
