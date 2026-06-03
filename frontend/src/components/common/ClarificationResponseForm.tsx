
import React, { useState } from "react";

interface ClarificationResponseFormProps {
  onSubmit: (response: string) => Promise<void>;
  onCancel: () => void;
  managerQuestion?: string;
  loading?: boolean;
}

const ClarificationResponseForm: React.FC<ClarificationResponseFormProps> = ({
  onSubmit,
  onCancel,
  managerQuestion,
  loading = false,
}) => {
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) {
      setError("Please provide a response.");
      return;
    }
    setError("");
    await onSubmit(response.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {managerQuestion && (
        <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-500 mb-1">
            Manager's question
          </p>
          <p className="text-sm text-orange-900 dark:text-orange-200">
            {managerQuestion}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Your response
        </label>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={4}
          placeholder="Provide clarification details..."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting…" : "Submit response"}
        </button>
      </div>
    </form>
  );
};

export default ClarificationResponseForm;