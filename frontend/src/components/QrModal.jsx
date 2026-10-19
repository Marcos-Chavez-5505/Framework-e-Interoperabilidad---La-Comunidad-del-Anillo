import { useEffect, useState } from 'react';
import { fetchQrBlob, getQrErrorMessage } from '../api/qr';

export default function QrModal({ track, onClose }) {
  const [status, setStatus] = useState('loading');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    fetchQrBlob(track.documentId)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
        setStatus('ready');
      })
      .catch(async (err) => {
        if (!active) return;
        setError(await getQrErrorMessage(err));
        setStatus('error');
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [track.documentId, attempt]);

  const retry = () => {
    setStatus('loading');
    setError('');
    setImageUrl('');
    setAttempt((value) => value + 1);
  };

  return (
    <div className="qr-popover card" role="dialog" aria-label="Código QR de la canción">
      <div className="card-body text-center position-relative">
        <button type="button" className="qr-close" aria-label="Cerrar" onClick={onClose}>
          {'\u00D7'}
        </button>

        {status === 'loading' && (
          <div className="d-flex flex-column align-items-center gap-2 py-4">
            <div className="spinner-border text-primary" role="status" />
            <span className="small text-secondary">Generando QR…</span>
          </div>
        )}

        {status === 'ready' && imageUrl && (
          <img
            src={imageUrl}
            alt={`QR de ${track.title}`}
            className="img-fluid rounded bg-white p-2"
            style={{ maxWidth: '230px' }}
          />
        )}

        {status === 'error' && (
          <div className="py-3">
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {error}
            </div>
            <button type="button" className="btn btn-primary" onClick={retry}>
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
