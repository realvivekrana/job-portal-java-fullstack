import Modal from './Modal'

export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : ''}`} onClick={onConfirm} disabled={busy}>
          {busy ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}