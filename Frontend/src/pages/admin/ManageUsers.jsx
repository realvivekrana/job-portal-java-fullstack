import { useState } from 'react'
import Pagination from '../../components/common/Pagination'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import ConfirmModal from '../../components/common/ConfirmModal'
import useApi from '../../hooks/useApi'
import useAuth from '../../hooks/useAuth'
import useDebounce from '../../hooks/useDebounce'
import useToast from '../../hooks/useToast'
import { getAdminUsers, setUserActive } from '../../api/authApi'
import { formatDate, getErrorMessage } from '../../utils/helpers'

const ROLE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'CANDIDATE', label: 'Candidates' },
  { value: 'RECRUITER', label: 'Recruiters' },
  { value: 'ADMIN', label: 'Admins' },
]

export default function ManageUsers() {
  const toast = useToast()
  const { user: me } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(0)
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const debounced = useDebounce(keyword, 400)

  const { data, error, loading, reload } = useApi(
    () => getAdminUsers({ keyword: debounced.trim() || undefined, role: role || undefined, page, size: 10 }),
    [debounced, role, page],
  )

  const toggle = async () => {
    setBusy(true)
    try {
      await setUserActive(target.id, !target.active)
      toast.success(target.active ? 'User disabled' : 'User enabled')
      setTarget(null)
      reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>{data ? `${data.totalElements} user${data.totalElements === 1 ? '' : 's'}` : 'Enable or disable accounts.'}</p>
        </div>
      </div>

      <div className="row" style={{ marginBottom: '1rem' }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search by name or email" value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(0) }} aria-label="Search users" />
      </div>
      <div className="tabs">
        {ROLE_FILTERS.map((r) => (
          <button key={r.value} className={`chip${role === r.value ? ' active' : ''}`}
            onClick={() => { setRole(r.value); setPage(0) }}>{r.label}</button>
        ))}
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loader />}
      {data && data.content.length === 0 && <EmptyState icon="👤" title="No users found" />}
      {data && data.content.length > 0 && (
        <div style={{ opacity: loading ? 0.6 : 1 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {data.content.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-neutral">{u.role}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td><span className={`badge ${u.active ? 'badge-active' : 'badge-closed'}`}>{u.active ? 'Active' : 'Disabled'}</span></td>
                    <td>
                      {u.id === me.id ? (
                        <span className="muted small">You</span>
                      ) : (
                        <button className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-success'}`} onClick={() => setTarget(u)}>
                          {u.active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      )}

      {target && (
        <ConfirmModal
          title={target.active ? 'Disable this user?' : 'Enable this user?'}
          message={
            target.active
              ? `${target.name} will not be able to sign in until the account is enabled again.`
              : `${target.name} will be able to sign in again.`
          }
          confirmLabel={target.active ? 'Disable' : 'Enable'}
          danger={target.active}
          busy={busy}
          onConfirm={toggle}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  )
}