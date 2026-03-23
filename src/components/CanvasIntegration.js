'use client';

import { useState, useEffect } from 'react';

export default function CanvasIntegration({ userId }) {
  const [canvasConnected, setCanvasConnected] = useState(false);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncMessage, setSyncMessage] = useState(null);
  const [canvasBaseUrl, setCanvasBaseUrl] = useState('https://canvas.instructure.com/api/v1');
  const [personalToken, setPersonalToken] = useState('');

  // Check connection on mount.
  useEffect(() => {
    checkCanvasConnection();
  }, []);

  const checkCanvasConnection = async () => {
    try {
      const response = await fetch('/api/canvas/sync');
      if (response.ok) {
        setCanvasConnected(true);
        const data = await response.json();
        setUpcomingAssignments(data.upcoming || []);
      } else {
        setCanvasConnected(false);
      }
    } catch {
      setCanvasConnected(false);
    }
  };

  const fetchUpcomingAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/canvas/sync');
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      setUpcomingAssignments(data.upcoming || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersonalToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/canvas/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: personalToken.trim(),
          baseUrl: canvasBaseUrl.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save Canvas token');
      }

      setCanvasConnected(true);
      setPersonalToken('');
      setSyncMessage('Canvas personal token saved. You can now sync assignments.');
      await fetchUpcomingAssignments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAssignments = async () => {
    setLoading(true);
    setSyncMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/canvas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync assignments');
      }

      const data = await response.json();
      setSyncMessage(`${data.total} assignments synced to your task list!`);
      fetchUpcomingAssignments();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setLoading(true);
    setError(null);
    setSyncMessage(null);
    fetch('/api/canvas/token', { method: 'DELETE' })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to disconnect Canvas');
        }
        setCanvasConnected(false);
        setUpcomingAssignments([]);
        setSyncMessage('Canvas connection removed.');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-on-surface">Canvas LMS Integration</h2>
        <span className={`inline-block h-3 w-3 rounded-full ${canvasConnected ? 'bg-secondary' : 'bg-error'}`} />
      </div>

      {!canvasConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-on-surface-variant">
            Personal token mode: paste your Canvas API token and Canvas API base URL to sync assignments.
          </p>

          <form onSubmit={handleSavePersonalToken} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Canvas API Base URL</label>
              <input
                type="url"
                value={canvasBaseUrl}
                onChange={(e) => setCanvasBaseUrl(e.target.value)}
                placeholder="https://your-school.instructure.com/api/v1"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Canvas Personal Access Token</label>
              <input
                type="password"
                value={personalToken}
                onChange={(e) => setPersonalToken(e.target.value)}
                placeholder="Paste your Canvas token"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-sm text-on-surface outline-none focus:border-secondary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !personalToken.trim() || !canvasBaseUrl.trim()}
              className="w-full rounded-lg bg-secondary px-4 py-2 font-semibold text-on-secondary transition-colors hover:bg-secondary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Token'}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={handleSyncAssignments}
              disabled={loading}
              className="flex-1 rounded-lg bg-secondary px-4 py-2 font-semibold text-on-secondary transition-colors hover:bg-secondary/90 disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync Next 7 Days'}
            </button>
            <button
              onClick={handleDisconnect}
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container px-4 py-2 font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              Disconnect
            </button>
          </div>

          {syncMessage && (
            <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3 text-sm text-secondary">
              ✓ {syncMessage}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
              ✗ {error}
            </div>
          )}

          {upcomingAssignments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-on-surface">Upcoming (Next 7 Days)</h3>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {upcomingAssignments.map((assignment, idx) => {
                  const dueDate = new Date(assignment.due_at);
                  const today = new Date();
                  const daysUntil = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-outline-variant/10 bg-surface-container p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-on-surface">{assignment.name}</p>
                          <p className="text-xs text-on-surface-variant">{assignment.course_name}</p>
                        </div>
                        <span className="whitespace-nowrap rounded-full bg-tertiary/20 px-2 py-1 text-xs font-semibold text-tertiary">
                          {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                        </span>
                      </div>
                      {assignment.description && (
                        <p className="mt-2 text-xs text-on-surface-variant line-clamp-2">
                          {assignment.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {upcomingAssignments.length === 0 && !loading && (
            <p className="text-sm text-on-surface-variant">No upcoming assignments in the next 7 days.</p>
          )}
        </div>
      )}
    </div>
  );
}
